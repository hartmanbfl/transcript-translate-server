import { Server } from 'socket.io';
let io;
let clientConnections;
let clientIoSocket;
let controlIo;
let controlConnections;
let controlIoSocket;
export class SocketIoService {
    static extractTenantFromNamespace(namespace) {
        if (namespace.startsWith("/control-") || namespace.startsWith("/client-")) {
            const firstDash = namespace.indexOf("-");
            if (firstDash !== -1) {
                return namespace.substring(firstDash + 1);
            }
        }
        return "";
    }
}
export const initializeSocketIo = (server) => {
    io = new Server(server, {
        connectionStateRecovery: {},
        path: '/socket.io',
        cors: {
            origin: "*"
        }
    });
    controlIo = io.of("/control");
    // Multi tenant support (church-<tenant ID>)
    clientConnections = io.of(/^\/church-[0-9a-z-]+$/);
    controlConnections = io.of(/^\/control-[0-9a-z-]+$/);
    return { controlIo, io, clientConnections, controlConnections };
};
export const getControlIo = () => {
    return controlIo;
};
export const getClientIo = () => {
    return io;
};
export const setControlIoSocket = (socket) => {
    controlIoSocket = socket;
};
export const getControlIoSocket = () => {
    return controlIoSocket;
};
export const setClientIoSocket = (socket) => {
    clientIoSocket = socket;
};
export const getClientIoSocket = () => {
    return clientIoSocket;
};
export const outputClientIo = async () => {
    const sockets = await io.fetchSockets();
    for (const socket of sockets) {
        console.log(`Socket ID: ${socket.id}`);
        console.log(`Socket Handshake: ${socket.handshake}`);
        console.log(`Socket Rooms: ${socket.rooms}`);
        console.log(`Socket Data: ${socket.data}`);
    }
};
export const outputControlIo = async () => {
    const sockets = await controlIo.fetchSockets();
    for (const socket of sockets) {
        console.log(`Control Socket ID: ${socket.id}`);
        console.log(`Control Socket Handshake: ${socket.handshake}`);
        console.log(`Control Socket Rooms: ${socket.rooms}`);
        console.log(`Control Socket Data: ${socket.data}`);
    }
};
