import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import EventEmitter from 'events';
import QRCode from 'qrcode';
import { Server } from 'socket.io';
import {
    addTranslationLanguageToService, removeTranslationLanguageFromService,
    registerForServiceTranscripts,
    printLanguageMap
} from './translate.js';
import { transcriptAvailServiceSub } from "./globals.js";

// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Get our own URL
const clientUrl = process.env.DEBABEL_CLIENT_URL || `localhost:${PORT}`;

// Deepgram needs to be imported as CommonJS
import { createClient} from "@deepgram/sdk";
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

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

// Create maps to track the languages per Service
const serviceLanguageMap = new Map();
const serviceSubscriptionMap = new Map();

// Streaming status per Service
const streamingStatusMap = new Map();

// Also track the subscriptions per room { Subscriber: Room[] }
const clientSubscriptionMap = new Map();
const roomSubscriptionMap = new Map();

// Create an emitter to track changes when clients join/leave rooms
const roomEmitter = new EventEmitter();

// Helper function to split the room into <serviceId:language>
const parseRoom = (room) => {
    const roomArray = room.split(":");
    const serviceId = roomArray[0];
    const language = roomArray[1];
    return {
        serviceId: serviceId,
        language: language
    }
}

// Helper function to make sure room exists for this server
const isRoomValid = (data) => {
    const { serviceId, language } = data;
    if (typeof serviceId === "undefined") {
        console.log(`ERROR: client is attempting to connect to a service that is not currently running on this server.`);
        return false;
    } else if (typeof language === "undefined") {
        console.log(`ERROR: client did not provide a language to subscribe to.`);
        return false;
    } else if (serviceLanguageMap.get(serviceId) === undefined) {
        console.log(`ERROR:  trying to subscribe to a service that isn't currently running.`);
        return false;
    }
    return true;
}

const disconnectClientFromAllRooms = (data) => {
    const { socket } = data;
    const client = socket.id;
    if (clientSubscriptionMap.get(client) === undefined) {
        console.log(`Client ${client} is already disconnected from all rooms.`);
    } else {
        let subscriberString = {};
        for (const [key, value] of clientSubscriptionMap.entries()) {
            subscriberString[key] = value;
        }
        const roomArray = clientSubscriptionMap.get(client);
        roomArray.forEach((room) => {
            console.log(`CLient ${client} leaving room ${room}`);
            socket.leave(room);
            removeClientFromRoom({ room, socketId: client });
        });
        // Remove this client completely
        clientSubscriptionMap.set(client, {});
        clientSubscriptionMap.delete(client);

    }
    let subscriberString = {};
    for (const [key, value] of clientSubscriptionMap.entries()) {
        subscriberString[key] = value;
    }
}

const addClientToRoom = (data) => {
    const { room, socketId } = data;
    //debug    console.log(`addClientToRoom: room-> ${room}, socketId-> ${socketId}`);
    if (roomSubscriptionMap.get(room) === undefined) {
        roomSubscriptionMap.set(room, [socketId]);
    } else {
        let subArray = roomSubscriptionMap.get(room);
        if (subArray.indexOf(socketId) === -1) {
            subArray.push(socketId);
        }
    }
}
const removeClientFromRoom = (data) => {
    const { room, socketId } = data;
    //debug    console.log(`removeClientFromRoom: room-> ${room}, socketId-> ${socketId}`);
    if (roomSubscriptionMap.get(room) === undefined) {
        if (process.env.EXTRA_DEBUGGING) console.log(`Not removing ${socketId} from roomSubscriptionMap room-> ${room} since it is now empty`);
    } else {
        // Remove this client from the room
        let subArray = roomSubscriptionMap.get(room);
        const index = subArray.indexOf(socketId);
        if (index !== -1) {
            subArray.splice(index, 1);
        }

        // If there are no other clients in this room, delete it
        if (subArray.length === 0) {
            console.log(`Room ${room} is now empty`);
            roomSubscriptionMap.delete(room);

            // Also remove this language for this service
            const { serviceId, language } = parseRoom(room);
            if (language !== "transcript") {
                console.log(`Removing language ${language} from service ${serviceId} in room ${room}`);
                const langArray = serviceLanguageMap.get(serviceId);
                const langIdx = langArray.indexOf(language);
                if (langIdx !== -1) {
                    langArray.splice(langIdx, 1);
                }
            }
        }
    }
}
const addRoomToClient = (data) => {
    const { room, socketId } = data;
    if (clientSubscriptionMap.get(socketId) === undefined) {
        clientSubscriptionMap.set(socketId, [room]);
    } else {
        let subArray = clientSubscriptionMap.get(socketId);
        if (subArray.indexOf(room) === -1) {
            subArray.push(room);
        }
    }
}
const removeRoomFromClient = (data) => {
    const { room, socketId } = data;
    if (roomSubscriptionMap.get(room) === undefined) {
        if (process.env.EXTRA_DEBUGGING) console.log(`Not removing ${socketId} from room-> ${room} since it is already empty`);
    } else {
        // Remove the room from the client
        let roomArray = clientSubscriptionMap.get(socketId);
        const roomIdx = roomArray.indexOf(room);
        if (roomIdx !== -1) {
            roomArray.splice(roomIdx, 1);
        }
    }
}


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


// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
};
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);


// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    const idParam = req.query.id;
    const user = firebaseAuth.currentUser;
    if (user !== null || process.env.TEST_MODE === "true") {
        next();
    } else {
        if (idParam != null) {
            res.redirect(`/login?id=${idParam}`);
        } else {
            res.redirect(`/login`);
        }
    }
}


const runOnStartup = (req, res, next) => {
    console.log(`Got request: method->${req.method}, url->${req.url}`);
    next();
}


app.use(express.static("public"));
app.use(express.json());
// DEBUG app.use(runOnStartup);

const generateQR = async (serviceId) => {
    const url = `${clientUrl}?serviceId=${serviceId}`;
    try {
        // File Test QRCode.toFile(path.join(__dirname, `qrcode-${serviceId}.png`), url);
        const qrcode = await QRCode.toString(url, { type: "svg" });
        return qrcode;
    } catch (err) {
        console.log(`ERROR generating QR code for: ${url}`);
        return null;
    }
}

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
app.get('/rooms/subscribers', async (req, res) => {
    try {
        let subscriberString = {};
        for (const [key, value] of roomSubscriptionMap.entries()) {
            subscriberString[key] = value;
        }
        res.json(subscriberString);
    } catch (error) {
        console.log(`Error getting subscribers: ${error}`);
        res.json({ clients: "0" });
    }
});

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
app.get('/clients/rooms', async (req, res) => {
    try {
        let subscriberString = {};
        for (const [key, value] of clientSubscriptionMap.entries()) {
            subscriberString[key] = value;
        }
        res.json(subscriberString);
    } catch (error) {
        console.log(`Error getting clients: ${error}`);
        res.json({ rooms: "0" });
    }
});

// Auth handler for keys from deepgram.  This is the method that triggers the server
// to start listening for client subscriptions.
app.post('/auth', async (req, res) => {
    try {
        const { serviceId, churchKey } = req.body
        console.log(`The service code is: ${serviceId}`);
        if (churchKey != process.env.CHURCH_KEY) {
            return res.json({ error: 'Key is missing or incorrect' })
        }

        // Get a Token used for making the Websocket calls in the front end
        const keyResult = await deepgram.manage.createProjectKey(process.env.DEEPGRAM_PROJECT, 
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

app.post('/qrcode', async (req, res) => {
    try {
        const { serviceId } = req.body;
        const qrcode = await generateQR(serviceId);
        res.json({ qrCode: qrcode });

    } catch (error) {
        console.error(`ERROR generating QR code: ${error}`);
        res.json({ error });
    }
})

// Used by client devices to get content for the UI
app.get('/churchinfo', async (req, res) => {
    try {
        const churchName = process.env.CHURCH_NAME;
        const churchLogoBase64 = process.env.CHURCH_LOGO_BASE64;
        const churchGreeting = process.env.CHURCH_GREETING;
        const churchMessage = process.env.CHURCH_MESSAGE;
        const churchWaitingMessage = process.env.CHURCH_WAITING_MESSAGE;
        const churchAdditionalWelcome = process.env.CHURCH_ADDITIONAL_WELCOME;
        const churchLang = process.env.HOST_LANGUAGE;
        const defaultServiceId = process.env.DEFAULT_SERVICE_ID;
        const translationLanguages = process.env.TRANSLATION_LANGUAGES;
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
        console.log(`Checking if ${serviceId} exists in the serviceSubscriptionMap: ${active}`);
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
            serviceTimeout: process.env.SERVICE_TIMEOUT,
            churchName: process.env.CHURCH_NAME,
            defaultServiceId: process.env.DEFAULT_SERVICE_ID,
            hostLanguage: process.env.HOST_LANGUAGE
        });
    } catch (error) {
        res.json({ error })
    }
})

// Login handler
app.post('/login', bodyParser.urlencoded({ extended: true }), async (req, res) => {
    const { id, email, password } = req.body;
    try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (id != null && id.length > 0) {
            res.redirect(`/control?id=${id}`);
        } else {
            res.redirect(`/control`);
        }
    } catch (error) {
        console.error(error);
        //      res.status(401).send('Unauthorized');
        res.redirect('/');
    }
});

// Logout handler
app.get('/logout', (req, res) => {
    firebaseAuth.signOut();
    res.redirect('/login');
});

//// Serve the Web Pages
const __dirname = path.resolve(path.dirname(''));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
})
app.get('/local', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})
app.get('/login', (req, res) => {
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