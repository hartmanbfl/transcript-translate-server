import { addClientToRoom, addRoomToClient, disconnectClientFromAllRooms, removeClientFromRoom, removeRoomFromClient } from "../../services/room.service.js";
import { addTranslationLanguageToService, removeTranslationLanguageFromService } from "../../translate.js";
import { serviceLanguageMap } from '../../repositories/index.repository.js';
import { parseRoom } from "../../utils/room.util.js";
import { roomEmitter } from "../../globals.js";
import { SocketIoService } from "../../services/socketio.service.js";
import { SessionService } from "../../services/session.service.js";
import { SubscriberService } from "../../services/subscriber.service.js";
export const registerClientHandlers = (io, socket) => {
    const tenantId = SocketIoService.extractTenantFromNamespace(socket.nsp.name);
    console.log(`Tenant ID for client: ${tenantId}`);
    const getNumberOfSubscribersInRoom = (room) => {
        var _a, _b, _c, _d;
        try {
            let subscribers = (_d = (_c = (_b = (_a = io.sockets) === null || _a === void 0 ? void 0 : _a.adapter) === null || _b === void 0 ? void 0 : _b.rooms) === null || _c === void 0 ? void 0 : _c.get(room)) === null || _d === void 0 ? void 0 : _d.size;
            if (subscribers === undefined)
                subscribers = 0;
            return subscribers;
        }
        catch (error) {
            console.log(`Error getting subscribers in room ${room}: ${error}`);
            return 0;
        }
    };
    socket.on('disconnect', () => {
        console.log(`Client ${socket.id} disconnected`);
        // Disconnect all rooms from this client
        disconnectClientFromAllRooms({ socket });
    });
    socket.on('register', (serviceId) => {
        console.log(`Client ${socket.id} registering for messages for service ${serviceId}`);
        const hearbeats = `${serviceId}:heartbeat`;
        socket.join(hearbeats);
    });
    // Rooms defined by <ServiceId:Language>
    socket.on('join', async (room) => {
        try {
            const { serviceId, language } = parseRoom(room);
            socket.join(room);
            console.log(`Client-> ${socket.id} just joined room-> ${room} in namespace-> ${socket.nsp.name}`);
            // Add this participant to the session
            let subscriber;
            const sessionId = await SessionService.getActiveSession(tenantId, serviceId);
            if (sessionId) {
                const userAgent = socket.handshake.headers["user-agent"];
                subscriber = await SubscriberService.subscriberAdded(sessionId, room, userAgent, socket.id);
            }
            // Add this client to the room
            let socketId = socket.id;
            addClientToRoom({ room, socketId });
            // Add this room to the client
            addRoomToClient({ room, socketId });
            const joinData = { serviceId, language, serviceLanguageMap };
            if (language != "transcript") {
                addTranslationLanguageToService(joinData);
            }
            // Let subscribers know that something has changed
            roomEmitter.emit('subscriptionChange', serviceId);
        }
        catch (error) {
            console.log(`ERROR joining room: ${error}`);
        }
    });
    socket.on('leave', async (room) => {
        try {
            const { serviceId, language } = parseRoom(room);
            socket.leave(room);
            console.log(`Client -> ${socket.id} is leaving room-> ${room} in namespace-> ${socket.nsp.name}`);
            // Remove this participant from the session
            const subscriberId = await SubscriberService.getSubscriberBySocketId(socket.id, room);
            if (subscriberId) {
                await SubscriberService.subscriberRemoved(subscriberId);
            }
            else {
                console.warn(`No subscriber found for this socket ID`);
            }
            // Remove this client from the room
            const socketId = socket.id;
            removeClientFromRoom({ room, socketId });
            // Remove this room from the client
            removeRoomFromClient({ room, socketId });
            const leaveData = { serviceId, language, serviceLanguageMap };
            if (language != "transcript") {
                // If no other subscribers to this language, remove it
                const subscribersInRoom = getNumberOfSubscribersInRoom(room);
                if (subscribersInRoom == 0) {
                    removeTranslationLanguageFromService(leaveData);
                }
            }
            // Let subscribers know that something has changed
            roomEmitter.emit('subscriptionChange', serviceId);
        }
        catch (error) {
            console.log(`ERROR in leave room: ${error}`);
        }
    });
};
