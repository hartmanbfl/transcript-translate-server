import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import {
    setupDeepgram, shutdownDeepgram, getCurrentDeepgramState,
    sendMicStreamToDeepgram, sendUrlStreamToDeepgram, abortStream, startupDeepgram
} from './deepgram.js';
import { registerForTranscripts, addTranslationLanguage } from './translate.js';

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

    // Audio stream from client mic
    socket.on('audio_available', (audio) => {
        sendMicStreamToDeepgram(deepgram, audio);
    }) 

    // Streaming Controls
    socket.on('streaming_start', () => {
        console.log(`Streaming started`);
        sendUrlStreamToDeepgram(deepgram, url);
    });
    socket.on('streaming_stop', () => {
        console.log(`Streaming stopped`);
        abortStream();
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

// Serve the Web app
app.use(express.static("public/"));
app.get('/', (req, res) => {
    res.sendFile(__dirname, + '/public/index.html');
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});