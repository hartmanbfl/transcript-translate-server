import { addClientToRoom, addRoomToClient, disconnectClientFromAllRooms, removeClientFromRoom, removeRoomFromClient } from "../../services/room.js";
import { addTranslationLanguageToService, removeTranslationLanguageFromService } from "../../translate.js";
import { serviceLanguageMap } from '../../repositories/index.js';
import { parseRoom } from "../../utils/room.js";
import { roomEmitter } from "../../globals.js";
export var registerClientHandlers = function (io, socket) {
    var getNumberOfSubscribersInRoom = function (room) {
        var _a, _b, _c, _d;
        try {
            var subscribers = (_d = (_c = (_b = (_a = io.sockets) === null || _a === void 0 ? void 0 : _a.adapter) === null || _b === void 0 ? void 0 : _b.rooms) === null || _c === void 0 ? void 0 : _c.get(room)) === null || _d === void 0 ? void 0 : _d.size;
            if (subscribers === undefined)
                subscribers = 0;
            return subscribers;
        }
        catch (error) {
            console.log("Error getting subscribers in room ".concat(room, ": ").concat(error));
            return 0;
        }
    };
    socket.on('disconnect', function () {
        console.log("Client ".concat(socket.id, " disconnected"));
        // Disconnect all rooms from this client
        disconnectClientFromAllRooms({ socket: socket });
    });
    socket.on('register', function (serviceId) {
        console.log("Client ".concat(socket.id, " registering for messages for service ").concat(serviceId));
        var hearbeats = "".concat(serviceId, ":heartbeat");
        socket.join(hearbeats);
    });
    // Rooms defined by <ServiceId:Language>
    socket.on('join', function (room) {
        try {
            var _a = parseRoom(room), serviceId = _a.serviceId, language = _a.language;
            socket.join(room);
            console.log("Client-> ".concat(socket.id, " just joined room-> ").concat(room));
            // Add this client to the room
            var socketId = socket.id;
            addClientToRoom({ room: room, socketId: socketId });
            // Add this room to the client
            addRoomToClient({ room: room, socketId: socketId });
            var joinData = { serviceId: serviceId, language: language, serviceLanguageMap: serviceLanguageMap };
            if (language != "transcript") {
                addTranslationLanguageToService(joinData);
            }
            // Let subscribers know that something has changed
            roomEmitter.emit('subscriptionChange', serviceId);
        }
        catch (error) {
            console.log("ERROR joining room: ".concat(error));
        }
    });
    socket.on('leave', function (room) {
        try {
            var _a = parseRoom(room), serviceId = _a.serviceId, language = _a.language;
            socket.leave(room);
            console.log("Client -> ".concat(socket.id, " is leaving room-> ").concat(room));
            // Remove this client from the room
            var socketId = socket.id;
            removeClientFromRoom({ room: room, socketId: socketId });
            // Remove this room from the client
            removeRoomFromClient({ room: room, socketId: socketId });
            var leaveData = { serviceId: serviceId, language: language, serviceLanguageMap: serviceLanguageMap };
            if (language != "transcript") {
                // If no other subscribers to this language, remove it
                var subscribersInRoom = getNumberOfSubscribersInRoom(room);
                if (subscribersInRoom == 0) {
                    removeTranslationLanguageFromService(leaveData);
                }
            }
            // Let subscribers know that something has changed
            roomEmitter.emit('subscriptionChange', serviceId);
        }
        catch (error) {
            console.log("ERROR in leave room: ".concat(error));
        }
    });
};
