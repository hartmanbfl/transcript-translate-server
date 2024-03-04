import * as dotenv from 'dotenv';
import { roomEmitter, transcriptAvailServiceSub } from "../../globals.js";
import { registerForServiceTranscripts } from "../../translate.js";
import { getActiveLanguages } from '../../services/church.service.js';
import { serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from '../../repositories/index.repository.js';
import { TranscriptService } from '../../services/transcript.service.js';
import { TenantService } from '../../services/tenant.service.js';
// Environment variables
dotenv.config();
export const registerControlHandlers = (controlIo, clientIo, socket) => {
    console.log(`Registering ${socket.id} connected to our socket.io control namespace`);
    socket.on('recordingStarted', async (data) => {
        const { serviceCode } = data;
        console.log(`Recording started for ${serviceCode}`);
        // start a new transcript
        const tenant = (await TenantService.getTenant("847feb43-7faf-4a82-affd-6efb72f45f86")).responseObject.tenant;
        const transcriptId = await TranscriptService.startTranscript(tenant);
    });
    socket.on('recordingStopped', (data) => {
        const { serviceCode } = data;
        console.log(`Recording stopped for ${serviceCode}`);
    });
    socket.on('disconnect', (reason) => {
        console.log(`Control io disconnected for client-> ${socket.id}, reason-> ${reason}`);
    });
    socket.on('transcriptReady', (data) => {
        const { serviceCode, transcript } = data;
        // Let all observers know that a new transcript is available
        //        console.log(`Received a transcriptReady message`);
        const transciptData = { serviceCode, transcript, serviceLanguageMap };
        transcriptAvailServiceSub.next(transciptData);
    });
    // Listen for changes in the rooms
    socket.on('monitor', (data) => {
        const room = data;
        console.log(`Control is monitoring ${room}`);
        socket.join(room);
        // Start up our transcript listerner for this service code
        const listenerData = { io: clientIo, serviceId: room, serviceLanguageMap, serviceSubscriptionMap };
        registerForServiceTranscripts(listenerData);
        roomEmitter.on('subscriptionChange', (service) => {
            if (process.env.EXTRA_DEBUGGING)
                console.log(`Detected subscription change for service: ${service}`);
            const jsonString = getActiveLanguages(clientIo, service);
            const room = service;
            if (process.env.EXTRA_DEBUGGING)
                console.log(`Attempting to emit: ${JSON.stringify(jsonString, null, 2)} to control room: ${room}`);
            socket.emit(room, jsonString);
        });
    });
    socket.on('heartbeat', (data) => {
        const { serviceCode, status } = data;
        streamingStatusMap.set(serviceCode, status);
        // Send the heartbeat out to all subscribers in this service
        if (status == "livestreaming") {
            const room = `${serviceCode}:heartbeat`;
            clientIo.to(room).emit('livestreaming');
        }
        // Send back the current subscriber list
        const jsonString = getActiveLanguages(clientIo, serviceCode);
        socket.emit('subscribers', jsonString);
    });
};
