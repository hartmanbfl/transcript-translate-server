import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path';

import { initializeSocketIo, setClientIoSocket, setControlIoSocket } from './services/socketio.js';

// Environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const MULTI_TENANT = process.env.MULTI_TENANT || false;

import { isAuthenticated } from './middlewares/auth.js';


const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(errorHandler);

app.use(express.static("public"));
app.use(express.json());
// DEBUG app.use(logRequests);

// Initialize the socket IO
const { controlIo: controlIo, io: io, clientConnections: clientConnections, controlConnections: controlConnections } = initializeSocketIo(server);

// Process the socket io requests
import { registerControlHandlers } from './controllers/socketio/controlHandler.js';
import { registerClientHandlers } from './controllers/socketio/clientHandler.js'

// Register for socket request handlers
const onControlConnection = (socket: Socket) => {
    registerControlHandlers(controlIo, io, socket);
}
const onClientConnection = (socket: Socket) => {
    // Single tenant
    registerClientHandlers(io, socket);
}

// Websocket connection to the client.  Moved this into its own connection in 
// order to make sure the server is running and connected first before starting
// to join clients to the stream
const listenForClients = () => {
    // Single tenant
    io.on('connection', (socket) => {
        setClientIoSocket(socket);
        onClientConnection(socket);
    })
    // Multi tenant
    clientConnections.on('connection', (socket) => {
        const clientConnection = socket.nsp;
    })
}

controlIo.on('connection', (socket) => {
    console.log(`Client ${socket.id} connected to our socket.io control namespace`);
    setControlIoSocket(socket);
    onControlConnection(socket);

    // Start listening for mobile clients to join
    listenForClients();
});
controlConnections.on('connection', (socket) => {
    const controlConnection = socket.nsp;
    console.log(`Connection to control connection in namespace: ${controlConnection.name}`);
    onControlConnection(socket);
})

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
import { Socket } from 'socket.io';
import { errorHandler } from './middlewares/error.js';
import { AppDataSource } from './data-source.js';
app.use('/clients', clientRouter);

// Serve the Web Pages
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

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('Ok');
})

// Connect to DB
AppDataSource.initialize()
  .then(async () => {
    console.log("Data Source has been initialized");
  })
  .catch((error) => console.log(error));

server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});