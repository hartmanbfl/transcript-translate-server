import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

import { initializeSocketIo, setClientIoSocket, setControlIoSocket } from './services/socketio.js';

// Environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

import { isAuthenticated } from './middlewares/auth.js';


const app = express();
const server = http.createServer(app);

app.use(cors());
//const io = new Server(server, {
//    connectionStateRecovery: {},
//    path: '/socket.io',
//    cors: {
//        origin: "*"
//    }
//});

app.use(express.static("public"));
app.use(express.json());
// DEBUG app.use(logRequests);

// Initialize the socket IO
const { controlIo: controlIo, io: io} = initializeSocketIo(server);

// Process the socket io requests
import { registerControlHandlers } from './controllers/socketio/controlHandler.js';
import { registerClientHandlers } from './controllers/socketio/clientHandler.js'


// Create a control namespace for messages between control page and the server
//const controlIo = io.of("/control")

// Create an emitter to track changes when clients join/leave rooms
//const roomEmitter = new EventEmitter();

// Register for socket request handlers
const onControlConnection = (socket) => {
    registerControlHandlers(controlIo, io, socket);
}
const onClientConnection = (socket) => {
    registerClientHandlers(io, socket);
}

// Websocket connection to the client.  Moved this into its own connection in 
// order to make sure the server is running and connected first before starting
// to join clients to the stream
const listenForClients = () => {
    io.on('connection', (socket) => {
        setClientIoSocket(socket);
        onClientConnection(socket);
    })
}

controlIo.on('connection', (socket) => {
    console.log(`Client ${socket.id} connected to our socket.io control namespace`);
    setControlIoSocket(socket);
    onControlConnection(socket);

    // Start listening for mobile clients to join
    listenForClients();
});

// API Calls for getting information about the subscribers
// Get all the subscribers in a specific room (Room = serviceId:lang)
// Example JSON:
// {
//   "clients": 2
// }
//app.get('/rooms/:id/subscribersInRoom', async (req, res) => {
//    try {
//        const roomId = req.params.id;
//        const clients = io.sockets.adapter.rooms.get(roomId).size;
//        res.json({ clients: clients });
//    } catch (error) {
//        console.log(`Error getting subscribers: ${error}`);
//        res.json({ clients: "0" });
//    }
//});

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


// Define authentication routes
import authRouter from './routes/auth.js';
app.use('/auth', authRouter);

// Define church routes
import churchRouter from './routes/church.js';
app.use('/church', churchRouter);

// Define deepgram routes
import deepgramRouter from './routes/deepgram.js';
app.use('/deepgram', deepgramRouter);

// QR Code routes
import qrCodeRouter from './routes/qrcode.js';
app.use('/qrcode', qrCodeRouter);

// Rooms routes
import roomRouter from './routes/room.js';
app.use('/rooms', roomRouter);

// Clients (sockets) routes
import clientRouter from './routes/clients.js';
app.use('/clients', clientRouter);

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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('Ok');
})

server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});