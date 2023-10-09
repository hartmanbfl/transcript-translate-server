import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import {
    setupDeepgram, shutdownDeepgram, getCurrentDeepgramState,
    sendMicStreamToDeepgram, sendUrlStreamToDeepgram, abortStream
} from './deepgram.js';
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


// Serve the Web app
//app.use(express.static("public/"));
//app.get('/', (req, res) => {
//    res.sendFile(__dirname, + '/public/index.html');
//});

// Websocket connection to the client
io.on('connection', (socket) => {
    console.log(`Client connected to our socket.io server`);
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    // Deepgram Controls
    socket.on('deepgram_connect', () => {
        console.log(`Deepgram connect requested`);
        deepgram = setupDeepgram(io);
    });
    socket.on('deepgram_disconnect', () => {
        console.log(`Deepgram disconnect requested`);
        shutdownDeepgram(deepgram);
    });
    socket.on('deepgram_state', () => {
        console.log(`Deepgram state requested`);
        const state = getCurrentDeepgramState(deepgram);
        console.log(`Current state of deepgram is: ${state}`);
    });

    // Audio stream from client mic
    socket.on('audio_available', (audio) => {
        sendMicStreamToDeepgram(deepgram, audio);
    }) 

    // Streaming Controls
    socket.on('streaming_start', () => {
        sendUrlStreamToDeepgram(deepgram, url);
    });
    socket.on('streaming_stop', () => {
        abortStream();
    });
    

    // Transcripts
    socket.on('transcript', (transcript) => {
        io.emit('transcript', transcript);
        console.log(`Transcript received by server: ${transcript}`);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});