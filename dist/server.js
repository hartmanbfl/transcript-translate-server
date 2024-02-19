import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { initializeSocketIo, setClientIoSocket, setControlIoSocket } from './services/socketio.js';
// Environment variables
dotenv.config();
var PORT = process.env.PORT || 3000;
var MULTI_TENANT = process.env.MULTI_TENANT || false;
import { isAuthenticated } from './middlewares/auth.js';
var app = express();
var server = http.createServer(app);
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
// DEBUG app.use(logRequests);
// Initialize the socket IO
var _a = initializeSocketIo(server), controlIo = _a.controlIo, io = _a.io, clientConnections = _a.clientConnections, controlConnections = _a.controlConnections;
// Process the socket io requests
import { registerControlHandlers } from './controllers/socketio/controlHandler.js';
import { registerClientHandlers } from './controllers/socketio/clientHandler.js';
// Register for socket request handlers
var onControlConnection = function (socket) {
    registerControlHandlers(controlIo, io, socket);
};
var onClientConnection = function (socket) {
    // Single tenant
    registerClientHandlers(io, socket);
};
// Websocket connection to the client.  Moved this into its own connection in 
// order to make sure the server is running and connected first before starting
// to join clients to the stream
var listenForClients = function () {
    // Single tenant
    io.on('connection', function (socket) {
        setClientIoSocket(socket);
        onClientConnection(socket);
    });
    // Multi tenant
    clientConnections.on('connection', function (socket) {
        var clientConnection = socket.nsp;
    });
};
controlIo.on('connection', function (socket) {
    console.log("Client ".concat(socket.id, " connected to our socket.io control namespace"));
    setControlIoSocket(socket);
    onControlConnection(socket);
    // Start listening for mobile clients to join
    listenForClients();
});
controlConnections.on('connection', function (socket) {
    var controlConnection = socket.nsp;
    console.log("Connection to control connection in namespace: ".concat(controlConnection.name));
    onControlConnection(socket);
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
var __dirname = path.resolve(path.dirname(''));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/login.html');
});
app.get('/local', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});
app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/views/login.html');
});
app.get('/participant', function (req, res) {
    res.sendFile(__dirname + '/views/participant.html');
});
// Add isAuthenticated if authentication is needed
app.get('/control', isAuthenticated, function (req, res) {
    res.sendFile(__dirname + '/views/control.html');
});
// Health check endpoint
app.get('/health', function (req, res) {
    res.status(200).send('Ok');
});
server.listen(PORT, function () {
    console.log("server started on port ".concat(PORT));
});
