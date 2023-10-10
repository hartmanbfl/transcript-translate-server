import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import {
    setupDeepgram, shutdownDeepgram, getCurrentDeepgramState,
    sendMicStreamToDeepgram, sendUrlStreamToDeepgram, abortStream, startupDeepgram
} from './deepgram.js';
import { registerForTranscripts, addTranslationLanguage } from './translate.js';

// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const app = express();
const server = http.createServer(app);

const url = "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service";

let deepgram;

app.use(cors());
const io = new Server(server, {
    path: '/socket.io',
    cors: {
        origin: "*"
    }
});


// Register the translation service to receive the transcripts
registerForTranscripts(io);

// Create a namespace for admin control features
const controlNsp = io.of('/admin-control');
controlNsp.on('connection', (socket) => {
    // Socket.io controls
    console.log(`Client connected to our socket.io admin namespace`);
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Deepgram Controls
    socket.on('deepgram_connect', () => {
        console.log(`Deepgram connect requested`);
        deepgram = setupDeepgram(io);
        startupDeepgram(deepgram);
    });
    socket.on('deepgram_disconnect', () => {
        console.log(`Deepgram disconnect requested`);
        shutdownDeepgram(deepgram);
    });
    socket.on('deepgram_state_request', () => {
        console.log(`Deepgram state requested`);
        const state = getCurrentDeepgramState(deepgram);
        console.log(`Current state of deepgram is: ${state}`);
        io.emit('deepgram_state', (state));
    });

    // Streaming Controls
    socket.on('streaming_start', () => {
        console.log(`Streaming started`);
        sendUrlStreamToDeepgram(deepgram, url);
    });
    socket.on('streaming_stop', () => {
        console.log(`Streaming stopped`);
        abortStream();
    });

    // Audio stream from client mic
    socket.on('audio_available', (audio) => {
        sendMicStreamToDeepgram(deepgram, audio);
    })
})

// Websocket connection to the client
io.on('connection', (socket) => {
    console.log(`Client connected to our socket.io public namespace`);
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Translation Rooms
    socket.on('subscribe', async (channel) => {
        console.log(`Subscribed call to room: ${channel}`);
        await socket.join(channel);
        addTranslationLanguage(channel);
        console.log(`Current rooms: ${JSON.stringify(socket.rooms)}`);
    });
    socket.on('unsubscribe', (channel) => {
        console.log(`Unsubscribing from ${channel}`);
        socket.leave(channel);
    });

    // Transcripts
    socket.on('transcript', (transcript) => {
        io.emit('transcript', transcript);
        console.log(`Transcript received by server: ${transcript}`);
    });
});

// Initialize Firebase Admin SDK
//admin.initializeApp({
//    credential: admin.credential.applicationDefault(),
//    databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
//  });

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

  // Login page
app.get('/login', (req, res) => {
    res.send(`
      <form action="/login" method="POST">
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Login</button>
      </form>
    `);
  });
  
  // Login handler
  app.post('/login', bodyParser.urlencoded({ extended: true }), async (req, res) => {
    const { email, password } = req.body;
  
    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.status(401).send('Invalid email or password');
    }
  });
  
  // Logout handler
  app.get('/logout', (req, res) => {
    firebaseAuth.signOut();
    res.redirect('/login');
  });


// Serve the Web app
app.use(express.static("public/"));
app.get('/', isAuthenticated, (req, res) => {
    const user = firebaseAuth.currentUser;
    console.log(`Allowing in ${user.displayName}`);
//    res.sendFile(__dirname, + '/public/index.html');
    res.sendFile('index.html', { root: 'public' });
//    res.send(`hello ${user.displayName}`);
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});