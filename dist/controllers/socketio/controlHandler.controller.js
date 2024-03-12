import * as dotenv from 'dotenv';
import { roomEmitter, transcriptAvailServiceSub } from "../../globals.js";
import { registerForServiceTranscripts } from "../../translate.js";
import { getActiveLanguages } from '../../services/church.service.js';
import { serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from '../../repositories/index.repository.js';
import { TranscriptService } from '../../services/transcript.service.js';
import { SocketIoService } from '../../services/socketio.service.js';
// Environment variables
dotenv.config();
export const registerControlHandlers = (controlIo, socketIoServer, socket) => {
    console.log(`Registering ${socket.id} connected to our socket.io control namespace: ${controlIo.name}`);
    socket.on('recordingStarted', async (data) => {
        const { serviceCode } = data;
        console.log(`Recording started for ${serviceCode} on namespace ${socket.nsp.name}`);
        // Make sure no translations are happening for this tenant
        //        const tenant: Tenant | null = (await TenantService.getTenantByChurchKey("GDOT")).responseObject.tenant;
        const tenantId = SocketIoService.extractTenantFromNamespace(socket.nsp.name);
        console.log(`Starting transcript for tenant: ${tenantId}`);
        if (tenantId) {
            await TranscriptService.stopAllTranscripts(tenantId, serviceCode);
            // start a new transcript
            const transcriptId = await TranscriptService.startTranscript(tenantId, serviceCode);
        }
    });
    socket.on('recordingStopped', async (data) => {
        const { serviceCode } = data;
        console.log(`Recording stopped for ${serviceCode} on namespace ${socket.nsp.name}`);
        // stop transcript
        try {
            //            const tenant: Tenant | null = (await TenantService.getTenantByChurchKey("GDOT")).responseObject.tenant;
            const tenantId = SocketIoService.extractTenantFromNamespace(socket.nsp.name);
            if (tenantId.length === 0)
                throw new Error(`Tenant not found for this namespace`);
            const transcript = await TranscriptService.getActiveTranscript(tenantId, serviceCode);
            if (!transcript)
                throw new Error(`No active transcript found`);
            await TranscriptService.stopTranscript(transcript.id);
        }
        catch (error) {
            console.log(`Error: ${error}`);
        }
    });
    socket.on('disconnect', (reason) => {
        console.log(`Control io disconnected for client-> ${socket.id}, namespace-> ${socket.nsp.name} reason-> ${reason}`);
    });
    socket.on('transcriptReady', async (data) => {
        const { serviceCode, transcript } = data;
        // Let all observers know that a new transcript is available
        //        console.log(`Received a transcriptReady message`);
        const transciptData = { serviceCode, transcript, serviceLanguageMap };
        transcriptAvailServiceSub.next(transciptData);
        try {
            // write it to the DB
            //            const tenant: Tenant | null = (await TenantService.getTenantByChurchKey("GDOT")).responseObject.tenant;
            const tenantId = SocketIoService.extractTenantFromNamespace(socket.nsp.name);
            if (tenantId.length === 0)
                throw new Error(`Tenant ID not found for this namespace`);
            const transcriptEntity = await TranscriptService.getActiveTranscript(tenantId, serviceCode);
            if (!transcriptEntity)
                throw new Error(`No active transcript found`);
            const messageCount = await TranscriptService.incrementMessageCount(transcriptEntity.id);
            await TranscriptService.addPhrase(transcriptEntity, transcript, tenantId);
        }
        catch (error) {
            console.log(`Error: ${error}`);
        }
    });
    // Listen for changes in the rooms
    socket.on('monitor', (data) => {
        const room = data;
        console.log(`Control is monitoring ${room}`);
        socket.join(room);
        // Start up our transcript listerner for this service code
        const listenerData = { io: socketIoServer, serviceId: room, serviceLanguageMap, serviceSubscriptionMap };
        registerForServiceTranscripts(listenerData);
        roomEmitter.on('subscriptionChange', (service) => {
            console.log(`New room emitter listener.  Listener count now: ${roomEmitter.listenerCount('subscriptionChange')}`);
            if (process.env.EXTRA_DEBUGGING)
                console.log(`Detected subscription change for service: ${service}`);
            const jsonString = getActiveLanguages(socketIoServer, service);
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
            socketIoServer.to(room).emit('livestreaming');
        }
        // Send back the current subscriber list
        const jsonString = getActiveLanguages(socketIoServer, serviceCode);
        socket.emit('subscribers', jsonString);
    });
};
