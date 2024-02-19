var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { clientSubscriptionMap, roomSubscriptionMap, serviceLanguageMap } from "../repositories/index.js";
import { parseRoom } from "../utils/room.js";
import { getClientIo } from "./socketio.js";
export var getSubscribersInRoom = function (roomId) {
    var _a, _b, _c, _d;
    try {
        var clientIo = getClientIo();
        var clients = (_d = (_c = (_b = (_a = clientIo === null || clientIo === void 0 ? void 0 : clientIo.sockets) === null || _a === void 0 ? void 0 : _a.adapter) === null || _b === void 0 ? void 0 : _b.rooms) === null || _c === void 0 ? void 0 : _c.get(roomId)) === null || _d === void 0 ? void 0 : _d.size;
        return {
            success: true,
            statusCode: 200,
            message: "Subscribers in room ".concat(roomId),
            responseObject: {
                clients: clients != null ? clients : 0
            }
        };
    }
    catch (error) {
        console.log("Error getting subscribers: ".concat(error));
        return {
            success: false,
            statusCode: 400,
            message: "Error getting subscribers in room ".concat(roomId),
            responseObject: {
                clients: "0"
            }
        };
    }
};
export var getSubscribersInAllRooms = function () {
    var e_1, _a;
    try {
        var subscriberString = {};
        try {
            for (var _b = __values(roomSubscriptionMap.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                subscriberString[key] = value;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return {
            success: true,
            statusCode: 200,
            message: "Subscriber List",
            responseObject: {
                subscribers: subscriberString
            }
        };
    }
    catch (error) {
        console.log("Error getting subscribers: ".concat(error));
        return {
            success: false,
            statusCode: 400,
            message: "Error getting subscriber list",
            responseObject: {
                subscribers: "0"
            }
        };
    }
};
export var getRoomsForAllClients = function () {
    var e_2, _a;
    try {
        var subscriberString = {};
        try {
            for (var _b = __values(clientSubscriptionMap.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
                subscriberString[key] = value;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return {
            success: true,
            statusCode: 200,
            message: "Getting all rooms for all clients",
            responseObject: {
                subscriberString: subscriberString
            }
        };
    }
    catch (error) {
        console.log("Error getting clients: ".concat(error));
        return {
            success: false,
            statusCode: 400,
            message: "Error getting all rooms for all clients",
            responseObject: {
                rooms: "0"
            }
        };
    }
};
export var disconnectClientFromAllRooms = function (data) {
    var e_3, _a, e_4, _b;
    var socket = data.socket;
    var client = socket.id;
    if (clientSubscriptionMap.get(client) === undefined) {
        console.log("Client ".concat(client, " is already disconnected from all rooms."));
    }
    else {
        var subscriberString_1 = {};
        try {
            for (var _c = __values(clientSubscriptionMap.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), key = _e[0], value = _e[1];
                subscriberString_1[key] = value;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var roomArray = clientSubscriptionMap.get(client);
        roomArray.forEach(function (room) {
            console.log("CLient ".concat(client, " leaving room ").concat(room));
            socket.leave(room);
            removeClientFromRoom({ room: room, socketId: client });
        });
        // Remove this client completely
        clientSubscriptionMap.set(client, {});
        clientSubscriptionMap.delete(client);
    }
    var subscriberString = {};
    try {
        for (var _f = __values(clientSubscriptionMap.entries()), _g = _f.next(); !_g.done; _g = _f.next()) {
            var _h = __read(_g.value, 2), key = _h[0], value = _h[1];
            subscriberString[key] = value;
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
        }
        finally { if (e_4) throw e_4.error; }
    }
};
export var addClientToRoom = function (data) {
    var room = data.room, socketId = data.socketId;
    //debug    console.log(`addClientToRoom: room-> ${room}, socketId-> ${socketId}`);
    if (roomSubscriptionMap.get(room) === undefined) {
        roomSubscriptionMap.set(room, [socketId]);
    }
    else {
        var subArray = roomSubscriptionMap.get(room);
        if ((subArray === null || subArray === void 0 ? void 0 : subArray.indexOf(socketId)) === -1) {
            subArray.push(socketId);
        }
    }
};
export var removeClientFromRoom = function (data) {
    var room = data.room, socketId = data.socketId;
    //debug    console.log(`removeClientFromRoom: room-> ${room}, socketId-> ${socketId}`);
    if (roomSubscriptionMap.get(room) === undefined) {
        if (process.env.EXTRA_DEBUGGING)
            console.log("Not removing ".concat(socketId, " from roomSubscriptionMap room-> ").concat(room, " since it is now empty"));
    }
    else {
        // Remove this client from the room
        var subArray = roomSubscriptionMap.get(room);
        var index = subArray !== undefined ? subArray.indexOf(socketId) : -1;
        if (index !== -1) {
            subArray.splice(index, 1);
        }
        // If there are no other clients in this room, delete it
        if ((subArray === null || subArray === void 0 ? void 0 : subArray.length) === 0) {
            console.log("Room ".concat(room, " is now empty"));
            roomSubscriptionMap.delete(room);
            // Also remove this language for this service
            var _a = parseRoom(room), serviceId = _a.serviceId, language = _a.language;
            if (language !== "transcript") {
                console.log("Removing language ".concat(language, " from service ").concat(serviceId, " in room ").concat(room));
                var langArray = serviceLanguageMap.get(serviceId);
                var langIdx = langArray.indexOf(language);
                if (langIdx !== -1) {
                    langArray.splice(langIdx, 1);
                }
            }
        }
    }
};
export var addRoomToClient = function (data) {
    var room = data.room, socketId = data.socketId;
    if (clientSubscriptionMap.get(socketId) === undefined) {
        clientSubscriptionMap.set(socketId, [room]);
    }
    else {
        var subArray = clientSubscriptionMap.get(socketId);
        if (subArray.indexOf(room) === -1) {
            subArray.push(room);
        }
    }
};
export var removeRoomFromClient = function (data) {
    var room = data.room, socketId = data.socketId;
    if (clientSubscriptionMap.get(socketId) === undefined) {
        if (process.env.EXTRA_DEBUGGING)
            console.log("Not removing ".concat(room, " from client-> ").concat(socketId, " since it is already empty"));
    }
    else {
        // Remove the room from the client
        console.log("Attempting to remove room ".concat(room, " from client ").concat(socketId));
        var roomArray = clientSubscriptionMap.get(socketId);
        var roomIdx = roomArray.indexOf(room);
        if (roomIdx !== -1) {
            roomArray.splice(roomIdx, 1);
        }
    }
};
// Helper function to make sure room exists for this server
export var isRoomValid = function (data) {
    var serviceId = data.serviceId, language = data.language;
    if (typeof serviceId === "undefined") {
        console.log("ERROR: client is attempting to connect to a service that is not currently running on this server.");
        return false;
    }
    else if (typeof language === "undefined") {
        console.log("ERROR: client did not provide a language to subscribe to.");
        return false;
    }
    else if (serviceLanguageMap.get(serviceId) === undefined) {
        console.log("ERROR:  trying to subscribe to a service that isn't currently running.");
        return false;
    }
    return true;
};
