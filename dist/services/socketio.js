import { Server } from 'socket.io';
var io;
var clientConnections;
var clientIoSocket;
var controlIo;
var controlConnections;
var controlIoSocket;
export var initializeSocketIo = function (server) {
    io = new Server(server, {
        connectionStateRecovery: {},
        path: '/socket.io',
        cors: {
            origin: "*"
        }
    });
    controlIo = io.of("/control");
    // Multi tenant support (church-<tenant ID>)
    clientConnections = io.of(/^\/church-\d+$/);
    controlConnections = io.of(/^\/control-\d+$/);
    return { controlIo: controlIo, io: io, clientConnections: clientConnections, controlConnections: controlConnections };
};
export var getControlIo = function () {
    return controlIo;
};
export var getClientIo = function () {
    return io;
};
export var setControlIoSocket = function (socket) {
    controlIoSocket = socket;
};
export var getControlIoSocket = function () {
    return controlIoSocket;
};
export var setClientIoSocket = function (socket) {
    clientIoSocket = socket;
};
export var getClientIoSocket = function () {
    return clientIoSocket;
};
