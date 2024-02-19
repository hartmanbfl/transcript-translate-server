import * as dotenv from 'dotenv';
import { roomEmitter, transcriptAvailServiceSub } from "../../globals.js";
import { registerForServiceTranscripts } from "../../translate.js";
import { getActiveLanguages } from '../../services/church.js';
import { serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from '../../repositories/index.js';
// Environment variables
dotenv.config();
export var registerControlHandlers = function (controlIo, clientIo, socket) {
    console.log("Registering ".concat(socket.id, " connected to our socket.io control namespace"));
    socket.on('disconnect', function (reason) {
        console.log("Control io disconnected for client-> ".concat(socket.id, ", reason-> ").concat(reason));
    });
    socket.on('transcriptReady', function (data) {
        var serviceCode = data.serviceCode, transcript = data.transcript;
        // Let all observers know that a new transcript is available
        //        console.log(`Received a transcriptReady message`);
        var transciptData = { serviceCode: serviceCode, transcript: transcript, serviceLanguageMap: serviceLanguageMap };
        transcriptAvailServiceSub.next(transciptData);
    });
    // Listen for changes in the rooms
    socket.on('monitor', function (data) {
        var room = data;
        console.log("Control is monitoring ".concat(room));
        socket.join(room);
        // Start up our transcript listerner for this service code
        var listenerData = { io: clientIo, serviceId: room, serviceLanguageMap: serviceLanguageMap, serviceSubscriptionMap: serviceSubscriptionMap };
        registerForServiceTranscripts(listenerData);
        roomEmitter.on('subscriptionChange', function (service) {
            if (process.env.EXTRA_DEBUGGING)
                console.log("Detected subscription change for service: ".concat(service));
            var jsonString = getActiveLanguages(clientIo, service);
            var room = service;
            if (process.env.EXTRA_DEBUGGING)
                console.log("Attempting to emit: ".concat(JSON.stringify(jsonString, null, 2), " to control room: ").concat(room));
            socket.emit(room, jsonString);
        });
    });
    socket.on('heartbeat', function (data) {
        var serviceCode = data.serviceCode, status = data.status;
        streamingStatusMap.set(serviceCode, status);
        // Send the heartbeat out to all subscribers in this service
        if (status == "livestreaming") {
            var room = "".concat(serviceCode, ":heartbeat");
            clientIo.to(room).emit('livestreaming');
        }
        // Send back the current subscriber list
        var jsonString = getActiveLanguages(clientIo, serviceCode);
        socket.emit('subscribers', jsonString);
    });
};
