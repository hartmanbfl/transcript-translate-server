var _a;
import { clientSubscriptionMap, roomSubscriptionMap, serviceLanguageMap } from "../repositories/index.repository.js";
import { parseRoom } from "../utils/room.util.js";
import { getClientIo } from "./socketio.service.js";
export class RoomService {
}
_a = RoomService;
RoomService.getSubscribersInRoom = async (roomId, tenantId) => {
    var _b, _c, _d, _e, _f;
    try {
        const clientIo = getClientIo(tenantId);
        let clients;
        if (!tenantId) {
            clients = (_e = (_d = (_c = (_b = clientIo.sockets) === null || _b === void 0 ? void 0 : _b.adapter) === null || _c === void 0 ? void 0 : _c.rooms) === null || _d === void 0 ? void 0 : _d.get(roomId)) === null || _e === void 0 ? void 0 : _e.size;
        }
        else {
            clients = (_f = clientIo.adapter.rooms.get(roomId)) === null || _f === void 0 ? void 0 : _f.size;
        }
        console.log(`getSubscribersInRoom: roomId-> ${roomId}, clients-> ${clients}`);
        return {
            success: true,
            statusCode: 200,
            message: `Subscribers in room ${roomId}`,
            responseObject: {
                clients: clients != null ? clients : 0
            }
        };
    }
    catch (error) {
        console.log(`Error getting subscribers: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Error getting subscribers in room ${roomId}`,
            responseObject: {
                clients: "0"
            }
        };
    }
};
RoomService.getSubscribersInAllRooms = () => {
    try {
        let subscriberString = {};
        for (const [key, value] of roomSubscriptionMap.entries()) {
            subscriberString[key] = value;
        }
        return {
            success: true,
            statusCode: 200,
            message: `Subscriber List`,
            responseObject: {
                subscribers: subscriberString
            }
        };
    }
    catch (error) {
        console.log(`Error getting subscribers: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Error getting subscriber list`,
            responseObject: {
                subscribers: "0"
            }
        };
    }
};
RoomService.getRoomsForAllClients = () => {
    try {
        let subscriberString = {};
        for (const [key, value] of clientSubscriptionMap.entries()) {
            subscriberString[key] = value;
        }
        return {
            success: true,
            statusCode: 200,
            message: `Getting all rooms for all clients`,
            responseObject: {
                subscriberString
            }
        };
    }
    catch (error) {
        console.log(`Error getting clients: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Error getting all rooms for all clients`,
            responseObject: {
                rooms: "0"
            }
        };
    }
};
RoomService.disconnectClientFromAllRooms = (data) => {
    const { socket } = data;
    const client = socket.id;
    if (clientSubscriptionMap.get(client) === undefined) {
        console.log(`Client ${client} is already disconnected from all rooms.`);
    }
    else {
        let subscriberString = {};
        for (const [key, value] of clientSubscriptionMap.entries()) {
            subscriberString[key] = value;
        }
        const roomArray = clientSubscriptionMap.get(client);
        roomArray.forEach((room) => {
            console.log(`CLient ${client} leaving room ${room}`);
            socket.leave(room);
            _a.removeClientFromRoom({ room, socketId: client });
        });
        // Remove this client completely
        clientSubscriptionMap.set(client, {});
        clientSubscriptionMap.delete(client);
    }
    let subscriberString = {};
    for (const [key, value] of clientSubscriptionMap.entries()) {
        subscriberString[key] = value;
    }
};
RoomService.addClientToRoom = (data) => {
    const { room, socketId } = data;
    //debug    console.log(`addClientToRoom: room-> ${room}, socketId-> ${socketId}`);
    if (roomSubscriptionMap.get(room) === undefined) {
        roomSubscriptionMap.set(room, [socketId]);
    }
    else {
        let subArray = roomSubscriptionMap.get(room);
        if ((subArray === null || subArray === void 0 ? void 0 : subArray.indexOf(socketId)) === -1) {
            subArray.push(socketId);
        }
    }
};
RoomService.removeClientFromRoom = (data) => {
    const { room, socketId } = data;
    //debug    console.log(`removeClientFromRoom: room-> ${room}, socketId-> ${socketId}`);
    if (roomSubscriptionMap.get(room) === undefined) {
        if (process.env.EXTRA_DEBUGGING)
            console.log(`Not removing ${socketId} from roomSubscriptionMap room-> ${room} since it is now empty`);
    }
    else {
        // Remove this client from the room
        let subArray = roomSubscriptionMap.get(room);
        const index = subArray !== undefined ? subArray.indexOf(socketId) : -1;
        if (index !== -1) {
            subArray.splice(index, 1);
        }
        // If there are no other clients in this room, delete it
        if ((subArray === null || subArray === void 0 ? void 0 : subArray.length) === 0) {
            console.log(`Room ${room} is now empty`);
            roomSubscriptionMap.delete(room);
            // Also remove this language for this service
            const { serviceId, language } = parseRoom(room);
            if (language !== "transcript") {
                console.log(`Removing language ${language} from service ${serviceId} in room ${room}`);
                const langArray = serviceLanguageMap.get(serviceId);
                const langIdx = langArray.indexOf(language);
                if (langIdx !== -1) {
                    langArray.splice(langIdx, 1);
                }
            }
        }
    }
};
RoomService.addRoomToClient = (data) => {
    const { room, socketId } = data;
    if (clientSubscriptionMap.get(socketId) === undefined) {
        clientSubscriptionMap.set(socketId, [room]);
    }
    else {
        let subArray = clientSubscriptionMap.get(socketId);
        if (subArray.indexOf(room) === -1) {
            subArray.push(room);
        }
    }
};
RoomService.removeRoomFromClient = (data) => {
    const { room, socketId } = data;
    if (clientSubscriptionMap.get(socketId) === undefined) {
        if (process.env.EXTRA_DEBUGGING)
            console.log(`Not removing ${room} from client-> ${socketId} since it is already empty`);
    }
    else {
        // Remove the room from the client
        console.log(`Attempting to remove room ${room} from client ${socketId}`);
        let roomArray = clientSubscriptionMap.get(socketId);
        const roomIdx = roomArray.indexOf(room);
        if (roomIdx !== -1) {
            roomArray.splice(roomIdx, 1);
        }
    }
};
// Helper function to make sure room exists for this server
RoomService.isRoomValid = (data) => {
    const { serviceId, language } = data;
    if (typeof serviceId === "undefined") {
        console.log(`ERROR: client is attempting to connect to a service that is not currently running on this server.`);
        return false;
    }
    else if (typeof language === "undefined") {
        console.log(`ERROR: client did not provide a language to subscribe to.`);
        return false;
    }
    else if (serviceLanguageMap.get(serviceId) === undefined) {
        console.log(`ERROR:  trying to subscribe to a service that isn't currently running.`);
        return false;
    }
    return true;
};
