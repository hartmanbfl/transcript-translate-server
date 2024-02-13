import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import EventEmitter from 'events';
import { Server } from 'socket.io';
import {
    addTranslationLanguageToService, removeTranslationLanguageFromService,
    registerForServiceTranscripts,
    printLanguageMap
} from './translate.js';
import { transcriptAvailServiceSub } from "./globals.js";

// Environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Get our own URL
const clientUrl = getDebabelClientUrl() || `localhost:${PORT}`;

// Deepgram needs to be imported as CommonJS
import { createClient} from "@deepgram/sdk";
import { loginController, logoutController } from './controllers/auth.js';
import { parseRoom } from './utils/room.js';
import { isAuthenticated } from './middlewares/auth.js';
import { addClientToRoom, addRoomToClient, disconnectClientFromAllRooms, getRoomsForAllClients, getSubscribersInAllRooms, removeClientFromRoom, removeRoomFromClient } from './controllers/room.js';
import { qrCodeController } from './controllers/qrcode.js';

// For now have Maps, but this may eventually be DBs for each tenant
import { getDebabelClientUrl, serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from './repositories/index.js';
import { getChurchAdditionalWelcome, getChurchDefaultServiceId, getChurchGreeting, getChurchLanguage, getChurchLogoBase64, getChurchMessage, getChurchName, getChurchSecretKey, getChurchServiceTimeout, getChurchTranslationLanguages, getChurchWaitingMessage } from './repositories/churchinfo.js';
import { getDeepgramApiKey, getDeepgramProjectId } from './repositories/deepgram.js';

const deepgram = createClient(getDeepgramApiKey());

const app = express();
const server = http.createServer(app);

app.use(cors());
const io = new Server(server, {
    connectionStateRecovery: {},
    path: '/socket.io',
    cors: {
        origin: "*"
    }
});

// Create a control namespace for messages between control page and the server
const controlIo = io.of("/control")

// Create an emitter to track changes when clients join/leave rooms
const roomEmitter = new EventEmitter();

// Websocket connection to the client.  Moved this into its own connection in 
// order to make sure the server is running and connected first before starting
// to join clients to the stream
const listenForClients = () => {
    io.on('connection', (socket) => {
        console.log(`Client ${socket.id} / ${socket.handshake.address} / ${socket.handshake.headers['user-agent']} connected to our socket.io public namespace`);
        if (!socket.recovered) {
            console.log(`Unable to recover socket connection with ${socket.id}`);
        }
        socket.on('disconnect', () => {
            console.log(`Client ${socket.id} disconnected`);

            // Disconnect all rooms from this client
            disconnectClientFromAllRooms({ socket })
        });

        socket.on('register', (serviceId) => {
            console.log(`Client ${socket.id} registering for messages for service ${serviceId}`);
            const hearbeats = `${serviceId}:heartbeat`;
            socket.join(hearbeats);
        });

        // Rooms defined by <ServiceId:Language>
        socket.on('join', (room) => {
            try {
                const { serviceId, language } = parseRoom(room);

                socket.join(room);

                console.log(`Client-> ${socket.id} just joined room-> ${room}`);

                // Add this client to the room
                let socketId = socket.id;
                addClientToRoom({ room, socketId });

                // Add this room to the client
                addRoomToClient({ room, socketId });

                const joinData = { serviceId, language, serviceLanguageMap };
                if (language != "transcript") {
                    addTranslationLanguageToService(joinData);
                }

                // Let subscribers know that something has changed
                roomEmitter.emit('subscriptionChange', serviceId);

            } catch (error) {
                console.log(`ERROR joining room: ${error}`);
            }
        })
        socket.on('leave', (room) => {
            try {
                const { serviceId, language } = parseRoom(room);

                socket.leave(room);
                console.log(`Client -> ${socket.id} is leaving room-> ${room}`);

                // Remove this client from the room
                const socketId = socket.id;
                removeClientFromRoom({ room, socketId });

                // Remove this room from the client
                removeRoomFromClient({ room, socketId });

                const leaveData = { serviceId, language, serviceLanguageMap };
                if (language != "transcript") {
                    // If no other subscribers to this language, remove it
                    const subscribersInRoom = getNumberOfSubscribersInRoom(room);
                    if (subscribersInRoom == 0) {
                        removeTranslationLanguageFromService(leaveData);
                    }
                }

                // Let subscribers know that something has changed
                roomEmitter.emit('subscriptionChange', serviceId);

            } catch (error) {
                console.log(`ERROR in leave room: ${error}`);
            }
        })
    })
}


controlIo.on('connection', (socket) => {
    console.log(`Client ${socket.id} connected to our socket.io control namespace`);
    // Start listening for mobile clients to join
    listenForClients();

    socket.on('disconnect', (reason) => {
        console.log(`Control io disconnected for client-> ${socket.id}, reason-> ${reason}`);
    });
    socket.on('transcriptReady', (data) => {
        const { serviceCode, transcript } = data;

        // Let all observers know that a new transcript is available
        //        console.log(`Received a transcriptReady message`);
        const transciptData = { serviceCode, transcript, serviceLanguageMap };
        transcriptAvailServiceSub.next(transciptData);
    })
    // Listen for changes in the rooms
    socket.on('monitor', (data) => {
        const room = data;
        console.log(`Control is monitoring ${room}`);
        socket.join(room);
        // Start up our transcript listerner for this service code
        const listenerData = { io, serviceId: room, serviceLanguageMap, serviceSubscriptionMap };
        registerForServiceTranscripts(listenerData);

        roomEmitter.on('subscriptionChange', (service) => {
            if (process.env.EXTRA_DEBUGGING) console.log(`Detected subscription change for service: ${service}`);
            const jsonString = getActiveLanguages(service);
            const room = service;
            
            if (process.env.EXTRA_DEBUGGING) console.log(`Attempting to emit: ${JSON.stringify(jsonString, null, 2)} to control room: ${room}`);
            socket.emit(room, jsonString);
        })
    })
    socket.on('heartbeat', (data) => {
        const { serviceCode, status } = data;
        streamingStatusMap.set(serviceCode, status);
        // Send the heartbeat out to all subscribers in this service
        if (status == "livestreaming") {
            const room = `${serviceCode}:heartbeat`;
            io.to(room).emit('livestreaming');
        }
        // Send back the current subscriber list
        const jsonString = getActiveLanguages(serviceCode);
        socket.emit('subscribers', jsonString); 
    })

});




app.use(express.static("public"));
app.use(express.json());
// DEBUG app.use(logRequests);

const getNumberOfSubscribersInRoom = (room) => {
    try {
        const subscribers = (io.sockets.adapter.rooms.get(room) == undefined) ?
            0 : io.sockets.adapter.rooms.get(room).size;
        return subscribers;
    } catch (error) {
        console.log(`Error getting subscribers in room ${room}: ${error}`);
        return 0;
    }
}

const getActiveLanguages = (serviceId) => {
    const jsonData = {
        serviceId: serviceId,
        languages: []
    };

    // Get the number of subscribers to the transcript
    const transcriptRoom = `${serviceId}:transcript`;
    const transcriptRoomObj = io.sockets.adapter.rooms.get(transcriptRoom);
    const transcriptSubscribers = (transcriptRoomObj == undefined) ? 0 : transcriptRoomObj.size;

    // Get the languages currently active 
    const langArray = serviceLanguageMap.get(serviceId);
    if (langArray == undefined || langArray.length == 0 && transcriptSubscribers == 0) {
//        return { result: "There are no languages currently being subscribed to." };
        return { jsonData };
    }

    // First put in transcript subscribers
    jsonData.languages.push({
        name: "Transcript",
        subscribers: transcriptSubscribers
    });

    // Get the number of subscribers for each of the languages
    for (let language in langArray) {
        const room = `${serviceId}:${langArray[language]}`;
        const clients = io.sockets.adapter.rooms.get(room).size;
        const languageEntry = {
            name: langArray[language],
            subscribers: clients
        };
        jsonData.languages.push(languageEntry);
    }

    return (jsonData);
}

// API Calls for getting information about the subscribers
// Get all the subscribers in a specific room (Room = serviceId:lang)
// Example JSON:
// {
//   "clients": 2
// }
app.get('/rooms/:id/subscribersInRoom', async (req, res) => {
    try {
        const roomId = req.params.id;
        const clients = io.sockets.adapter.rooms.get(roomId).size;
        res.json({ clients: clients });
    } catch (error) {
        console.log(`Error getting subscribers: ${error}`);
        res.json({ clients: "0" });
    }
});

// Return a JSON list of languages and subscribers for a service
// Example JSON:
//{
//  "serviceId": "12345",
//  "languages": [
//    {
//      name: "de",
//      subscribers: 2 
//    },
//    {
//      name: "es",
//      subscribers: 4 
//    },
//  ]
//}
app.get('/rooms/:serviceId/getActiveLanguages', async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const jsonString = getActiveLanguages(serviceId);
        res.json(jsonString);
    } catch (error) {
        console.log(`Error getting subscribers for service: ${error}`);
        res.json({ result: "Invalid request" });
    }
});

// Return status of the service
// Example JSON:
// {
//   "status": "offline"
// }
app.get('/rooms/:serviceId/getStreamingStatus', async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const streamingStatus = streamingStatusMap.get(serviceId);
        res.json({ status: streamingStatus });
    } catch (error) {
        console.error(`ERROR getting streaming status: ${error}`);
        res.json({ error });
    }
})


// Get all the subscribers in all the rooms
// Example JSON:
// {
//   "1234:de": [
//     "cENBYw_9R2EsjIe_AAAN"
//   ],
//   "1234:transcript": [
//     "cENBYw_9R2EsjIe_AAAN",
//     "MH_fui-MF6bG4kcdAAAR"
//   ],
//   "1234:uk": [
//     "MH_fui-MF6bG4kcdAAAR"
//   ]
// }
app.get('/rooms/subscribers', getSubscribersInAllRooms);

// Get all the clients (unique ID) in all the rooms
// Example JSON:
// {
//   "cENBYw_9R2EsjIe_AAAN": [
//     "1234:de",
//     "1234:transcript"
//   ],
//   "MH_fui-MF6bG4kcdAAAR": [
//     "1234:uk",
//     "1234:transcript"
//   ]
// }
app.get('/clients/rooms', getRoomsForAllClients);

// Auth handler for keys from deepgram.  This is the method that triggers the server
// to start listening for client subscriptions.
app.post('/auth', async (req, res) => {
    try {
        const { serviceId, churchKey } = req.body
        console.log(`The service code is: ${serviceId}`);
        if (churchKey != getChurchSecretKey) {
            return res.json({ error: 'Key is missing or incorrect' })
        }

        // Get a Token used for making the Websocket calls in the front end
        const keyResult = await deepgram.manage.createProjectKey(getDeepgramProjectId(),
            { 
                comment: "Temporary key - works for 10 secs",
                scopes: ["usage:write"],
                time_to_live_in_seconds: 10 
            })
//debug        console.log(`newKey: ${keyResult.result.key}`);

        res.json({ deepgramToken: keyResult.result.key })
    } catch (error) {
        console.error(`Caught error in auth: ${error}`);
        res.json({ error })
    }
});

app.post('/qrcode', qrCodeController);

// Used by client devices to get content for the UI
app.get('/churchinfo', async (req, res) => {
    try {
        const churchName = getChurchName();
        const churchLogoBase64 = getChurchLogoBase64();
        const churchGreeting = getChurchGreeting();
        const churchMessage = getChurchMessage();
        const churchWaitingMessage = getChurchWaitingMessage();
        const churchAdditionalWelcome = getChurchAdditionalWelcome();
        const churchLang = getChurchLanguage(); 
        const defaultServiceId = getChurchDefaultServiceId(); 
        const translationLanguages = getChurchTranslationLanguages();
        res.json({
            name: churchName, defaultServiceId: defaultServiceId, 
            greeting: churchGreeting,
            message: churchMessage, additionalWelcome: churchAdditionalWelcome, 
            waiting: churchWaitingMessage,
            language:  churchLang, translationLanguages: translationLanguages,
            base64Logo: churchLogoBase64
        })
    } catch (error) {
        res.json({ error });
    }
})

app.get('/serviceStatus', async (req, res) => {
    try {
        const { serviceId } = req.query;
        // See if this service ID exists in the service map
        const active = serviceSubscriptionMap.get(serviceId);
        if (process.env.EXTRA_DEBUGGING) console.log(`Checking if ${serviceId} exists in the serviceSubscriptionMap: ${active}`);
        if (active === true) {
            res.json( {active: true});
        } else {
            res.json( { active: false});
        }
    } catch (error) {
        res.json( { error });
    }
})

app.get('/configuration', async (req, res) => {
    try {
        res.json({
            serviceTimeout: getChurchServiceTimeout(), 
            churchName: getChurchName(), 
            defaultServiceId: getChurchDefaultServiceId(),
            hostLanguage: getChurchLanguage() 
        });
    } catch (error) {
        res.json({ error })
    }
})

// Define authentication routes
import authRouter from './routes/auth.js';
app.use('/auth', authRouter);

// Serve the Web Pages
const __dirname = path.resolve(path.dirname(''));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
})
app.get('/local', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})
app.get('/loginform', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
})
app.get('/participant', (req, res) => {
    res.sendFile(__dirname + '/views/participant.html');
})
// Add isAuthenticated if authentication is needed
app.get('/control', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/views/control.html');
})
app.get('/health', (req, res) => {
    res.status(200).send('Ok');
})

server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});