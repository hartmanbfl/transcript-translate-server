import { addClientToRoom, addRoomToClient, disconnectClientFromAllRooms, removeClientFromRoom, removeRoomFromClient } from "../../services/room.service.js";
import { addTranslationLanguageToService, removeTranslationLanguageFromService } from "../../translate.js";
import { serviceLanguageMap } from '../../repositories/index.repository.js';
import { parseRoom } from "../../utils/room.util.js";
import { roomEmitter } from "../../globals.js";
import { Server, Socket } from "socket.io";

export const registerClientHandlers = (io: NonNullable<Server>, socket: Socket) => {

    const getNumberOfSubscribersInRoom = (room: string) => {
        try {
            let subscribers = io.sockets?.adapter?.rooms?.get(room)?.size;
            if (subscribers === undefined)
               subscribers = 0;
            return subscribers;
        } catch (error) {
            console.log(`Error getting subscribers in room ${room}: ${error}`);
            return 0;
        }
    }

    socket.on('disconnect', () => {
        console.log(`Client ${socket.id} disconnected`);

        // Disconnect all rooms from this client
        disconnectClientFromAllRooms({ socket })
    });

    socket.on('register', (serviceId) => {
        console.log(`Client ${socket.id} registering for messages for service ${serviceId}`);
        const hearbeats = `${serviceId}:heartbeat`;
        socket.join(hearbeats);
    });

    // Rooms defined by <ServiceId:Language>
    socket.on('join', (room) => {
        try {
            const { serviceId, language } = parseRoom(room);

            socket.join(room);

            console.log(`Client-> ${socket.id} just joined room-> ${room}`);

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

        } catch (error) {
            console.log(`ERROR joining room: ${error}`);
        }
    })
    socket.on('leave', (room) => {
        try {
            const { serviceId, language } = parseRoom(room);

            socket.leave(room);
            console.log(`Client -> ${socket.id} is leaving room-> ${room}`);

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

        } catch (error) {
            console.log(`ERROR in leave room: ${error}`);
        }
    })
}