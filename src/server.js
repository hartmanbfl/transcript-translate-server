import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import { addTranslationLanguage, addTranslationLanguageToService, removeTranslationLanguageFromService, registerForServiceTranscripts, printSubscribersPerLanguage } from './translate.js';
import { transcriptAvailServiceSub } from "./globals.js";
import { Translation } from './translateClass.js'

// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Environment variables
dotenv.config();

// Deepgram needs to be imported as CommonJS
import pkg from "@deepgram/sdk";
const { Deepgram } = pkg;
const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);

const app = express();
const server = http.createServer(app);

app.use(cors());
const io = new Server(server, {
    path: '/socket.io',
    cors: {
        origin: "*"
    }
});

// Create a control namespace for messages between control page and the server
const controlIo = io.of("/control")


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
    }
    return true;
}


// Websocket connection to the client.  Moved this into its own connection in 
// order to make sure the server is running and connected first before starting
// to join clients to the stream
const listenForClients = () => {
    io.on('connection', (socket) => {
        console.log(`Client connected to our socket.io public namespace`);
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        // Rooms defined by <ServiceId:Language>
        socket.on('join', (room) => {
            const { serviceId, language } = parseRoom(room);
            console.log(`Joining service-> ${serviceId}, Language-> ${language}`);

            // Make sure sericeId and language are not undefined
            if (!isRoomValid({serviceId, language})) return;

            socket.join(room);

            const joinData = { serviceId, language, serviceLanguageMap };
            if (language != "transcript") {
                serviceLanguageMap = addTranslationLanguageToService(joinData);
            }
        })
        socket.on('leave', (room) => {
            const { serviceId, language } = parseRoom(room);
            // Make sure sericeId and language are not undefined
            if (!isRoomValid({serviceId, language})) return;

            socket.leave(room);
            console.log(`Leaving service-> ${serviceId}, Language-> ${language}`);
            const leaveData = { serviceId, language, serviceLanguageMap };
            if (language != "transcript") {
                serviceLanguageMap = removeTranslationLanguageFromService(leaveData);
            }
        })
    })
}

controlIo.on('connection', (socket) => {
    socket.on('disconnect', () => {
        console.log('Control io disconnected');
    });
    console.log(`Client connected to our socket.io control namespace`);
    socket.on('transcriptReady', (data) => {
        const { serviceCode, transcript } = data;

        // Let all observers know that a new transcript is available
        //        console.log(`Received a transcriptReady message`);
        const transciptData = { serviceCode, transcript, serviceLanguageMap };
        transcriptAvailServiceSub.next(transciptData);
    })
});


// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
const firebaseConfig = {
    apiKey: "AIzaSyAYS7YuGPQiJRT07_iZ3QXKPOmZUFNu1LI",
    authDomain: "realtimetranslation-583a6.firebaseapp.com",
    projectId: "realtimetranslation-583a6",
    storageBucket: "realtimetranslation-583a6.appspot.com",
    messagingSenderId: "184731763616",
    appId: "1:184731763616:web:9577e01a13863eb4861ac5",
    measurementId: "G-VHQ2V60SGS"
};
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);


// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    const user = firebaseAuth.currentUser;
    if (user !== null) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.use(express.static("public"));
app.use(express.json());

// Login handler
app.post('/login', bodyParser.urlencoded({ extended: true }), async (req, res) => {
    const { email, password } = req.body;

    try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        //      res.status(401).send('Unauthorized');
        res.redirect('/');
    }
});


// Auth handler for keys from deepgram.  This is the method that triggers the server
// to start listening for client subscriptions.
let serviceLanguageMap;
app.post('/auth', async (req, res) => {
    try {
        const { serviceId, churchKey } = req.body
        console.log(`The service code is: ${serviceId}`);
        if (churchKey != process.env.CHURCH_KEY) {
            return res.json({ error: 'Key is missing or incorrect' })
        }

        // Start up our transcript listerner for this service code
        const data = { io, serviceId };
        serviceLanguageMap = registerForServiceTranscripts(data);

        const newKey = await deepgram.keys.create(
            process.env.DEEPGRAM_PROJECT,
            'Temporary key - works for 10 secs',
            ['usage:write'],
            { timeToLive: 10 }
        )

        // server is ready, start listening for client connections
        listenForClients();
        res.json({ deepgramToken: newKey.key })
    } catch (error) {
        console.error(`Caught error in auth: ${error}`);
        res.json({ error })
    }
});

// Logout handler
app.get('/logout', (req, res) => {
    firebaseAuth.signOut();
    res.redirect('/login');
});

// Test creating namespaces dynamically.  The idea is to have a namespace
// per (church) Service. This may become too complicated, but keeping code 
// here as a reference of what I was trying to do.
app.get('/service/:serviceId', (req, res) => {
    const serviceId = req.params.serviceId;
    const dynNamespace = io.of('/' + serviceId);
    const translationObj = new Translation(dynNamespace);

    translationObj.registerForTranscripts();

    dynNamespace.on('connection', (socket) => {
        // Subscribe to a particular language 
        socket.on('subscribe', async (channel) => {
            console.log(`Subscribed call to room: ${channel}`);
            socket.join(channel);
            addTranslationLanguage(channel);
            console.log(`Current rooms: ${JSON.stringify(socket.rooms)}`);
        });
        socket.on('unsubscribe', (channel) => {
            console.log(`Unsubscribing from ${channel}`);
            socket.leave(channel);
        });
        socket.on('transcriptReady', (transcript) => {
            dynNamespace.emit('transcript', transcript);
            translationObj.transcriptAvailableSub.next(transcript);
        })
    })
})

//// Serve the Web Pages
const __dirname = path.resolve(path.dirname(''));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})
app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/views/admin.html');
})
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
})
app.get('/participant', (req, res) => {
    res.sendFile(__dirname + '/views/participant.html');
})
// Add isAuthenticated if authentication is needed
app.get('/control', (req, res) => {
    res.sendFile(__dirname + '/views/control.html');
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});