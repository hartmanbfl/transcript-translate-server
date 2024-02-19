var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
export var outputClientIo = function () { return __awaiter(void 0, void 0, void 0, function () {
    var sockets, sockets_1, sockets_1_1, socket;
    var e_1, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, io.fetchSockets()];
            case 1:
                sockets = _b.sent();
                try {
                    for (sockets_1 = __values(sockets), sockets_1_1 = sockets_1.next(); !sockets_1_1.done; sockets_1_1 = sockets_1.next()) {
                        socket = sockets_1_1.value;
                        console.log("Socket ID: ".concat(socket.id));
                        console.log("Socket Handshake: ".concat(socket.handshake));
                        console.log("Socket Rooms: ".concat(socket.rooms));
                        console.log("Socket Data: ".concat(socket.data));
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (sockets_1_1 && !sockets_1_1.done && (_a = sockets_1.return)) _a.call(sockets_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return [2 /*return*/];
        }
    });
}); };
export var outputControlIo = function () { return __awaiter(void 0, void 0, void 0, function () {
    var sockets, sockets_2, sockets_2_1, socket;
    var e_2, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, controlIo.fetchSockets()];
            case 1:
                sockets = _b.sent();
                try {
                    for (sockets_2 = __values(sockets), sockets_2_1 = sockets_2.next(); !sockets_2_1.done; sockets_2_1 = sockets_2.next()) {
                        socket = sockets_2_1.value;
                        console.log("Control Socket ID: ".concat(socket.id));
                        console.log("Control Socket Handshake: ".concat(socket.handshake));
                        console.log("Control Socket Rooms: ".concat(socket.rooms));
                        console.log("Control Socket Data: ".concat(socket.data));
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (sockets_2_1 && !sockets_2_1.done && (_a = sockets_2.return)) _a.call(sockets_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                return [2 /*return*/];
        }
    });
}); };
