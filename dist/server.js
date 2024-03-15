import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { initializeSocketIo, setClientIoSocket, setControlIoSocket } from './services/socketio.service.js';
import { UserService } from './services/user.service.js';
import { errorHandler } from './middleware/error.middleware.js';
import { AppDataSource } from './data-source.js';
// Environment variables
dotenv.config();
const PORT = process.env.PORT || 3000;
const MULTI_TENANT = process.env.MULTI_TENANT || false;
const USE_DATABASE = process.env.USE_DATABASE || false;
import { isAuthenticated } from './middleware/authentication.middleware.js';
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(errorHandler);
// Add the cookies to the Requests so that we can parse them
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
// DEBUG app.use(logRequests);
// Initialize the socket IO
const { controlIo: controlIo, io: io, clientNamespaces: clientNamespaces, controlNamespaces: controlNamespaces } = initializeSocketIo(server);
// Process the socket io requests
import { registerControlHandlers } from './controllers/socketio/controlHandler.controller.js';
import { registerClientHandlers } from './controllers/socketio/clientHandler.controller.js';
// Register for socket request handlers
const onControlConnection = (socket) => {
    registerControlHandlers(io, socket);
};
const onControlNamespaceConnection = (socket) => {
    registerControlHandlers(io, socket);
};
const onClientConnection = (socket) => {
    registerClientHandlers(io, socket);
};
const onClientNamespaceConnection = (socket) => {
    registerClientHandlers(io, socket);
};
// Websocket connection to the client.  Moved this into its own connection in 
// order to make sure the server is running and connected first before starting
// to join clients to the stream
const listenForClients = () => {
    // Single tenant
    io.on('connection', (socket) => {
        console.log(`Server got new connection: ${socket.id}`);
        setClientIoSocket(socket);
        onClientConnection(socket);
    });
    // Multi tenant
    clientNamespaces.on('connection', (socket) => {
        console.log(`Got client namespace connection: ${socket.nsp.name}`);
        onClientNamespaceConnection(socket);
    });
};
// Start listening for mobile clients to join
listenForClients();
controlIo.on('connection', (socket) => {
    console.log(`Control Page ${socket.id} connected to our socket.io control namespace`);
    setControlIoSocket(socket);
    onControlConnection(socket);
});
controlNamespaces.on('connection', (socket) => {
    const controlConnection = socket.nsp;
    console.log(`Connection to control connection in namespace: ${controlConnection.name}`);
    onControlNamespaceConnection(socket);
});
// Define tenant routes
import tenantRouter from './routes/tenants.routes.js';
app.use('/tenants', tenantRouter);
// Define theme routes
import themeRouter from './routes/themes.routes.js';
app.use('/themes', themeRouter);
// Define authentication routes
import authRouter from './routes/auth.routes.js';
app.use('/auth', authRouter);
// Define API user routes
import userRouter from './routes/user.routes.js';
app.use('/users', userRouter);
// Define church routes
import churchRouter from './routes/church.routes.js';
app.use('/church', churchRouter);
// Define deepgram routes
import deepgramRouter from './routes/deepgram.routes.js';
app.use('/deepgram', deepgramRouter);
// QR Code routes
import qrCodeRouter from './routes/qrcode.routes.js';
app.use('/qrcode', qrCodeRouter);
// Rooms routes
import roomRouter from './routes/room.routes.js';
app.use('/rooms', roomRouter);
// Clients (sockets) routes
import clientRouter from './routes/clients.routes.js';
import { TenantService } from './services/tenant.service.js';
app.use('/clients', clientRouter);
// Define API transcript routes
import transcriptRouter from './routes/transcript.routes.js';
app.use('/transcripts', transcriptRouter);
// Serve the Web Pages
const __dirname = path.resolve(path.dirname(''));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});
app.get('/local', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/views/login.html');
});
app.get('/participant', (req, res) => {
    res.sendFile(__dirname + '/views/participant.html');
});
// Add isAuthenticated if authentication is needed
app.get('/control', isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/views/control.html');
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('Ok');
});
// Connect to DB if using
if (USE_DATABASE) {
    AppDataSource.initialize()
        .then(async () => {
        console.log("Data Source has been initialized");
        // Create the default tenant and superadmin user
        const tenantId = await TenantService.createDefaultTenant();
        if (!tenantId)
            throw new Error("Tenant ID not found");
        await UserService.createSuperadminUser(tenantId);
    })
        .catch((error) => console.log(error));
}
server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
