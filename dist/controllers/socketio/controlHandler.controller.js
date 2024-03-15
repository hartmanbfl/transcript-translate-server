import * as dotenv from 'dotenv';
import { roomEmitter, transcriptAvailServiceSub } from "../../globals.js";
import { registerForServiceTranscripts } from "../../translate.js";
import { getActiveLanguages } from '../../services/church.service.js';
import { serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from '../../repositories/index.repository.js';
import { TranscriptService } from '../../services/transcript.service.js';
import { SocketIoService } from '../../services/socketio.service.js';
import { SessionService } from '../../services/session.service.js';
// Environment variables
dotenv.config();
export const registerControlHandlers = (socketIoServer, socket) => {
    console.log(`Registering ${socket.id} connected to our socket.io control namespace: ${socket.nsp.name}`);
    const tenantId = SocketIoService.extractTenantFromNamespace(socket.nsp.name);
    let sessionId;
    let clientConnection;
    let controlConnection;
    if (socket.nsp.name) {
        console.log(`Using namespace ${socket.nsp.name} to talk to client devices`);
        clientConnection = socketIoServer.of(`client-${tenantId}`);
        controlConnection = socket.nsp;
    }
    else {
        console.log(`Using server connection to talk to clients`);
        clientConnection = socketIoServer;
        controlConnection = socket;
    }
    socket.on('recordingStarted', async (data) => {
        const { serviceCode } = data;
        console.log(`Recording started for ${serviceCode} on namespace ${socket.nsp.name}`);
        if (!sessionId)
            throw new Error(`Session is not defined`);
        await SessionService.updateStatus(sessionId, "RECORDING");
        // Make sure no translations are happening for this tenant
        console.log(`Starting transcript for tenant: ${tenantId}`);
        if (tenantId) {
            await TranscriptService.stopAllTranscripts(tenantId, serviceCode);
            // start a new transcript
            const transcriptId = await TranscriptService.startTranscript(tenantId, serviceCode, sessionId);
        }
    });
    socket.on('recordingStopped', async (data) => {
        const { serviceCode } = data;
        console.log(`Recording stopped for ${serviceCode} on namespace ${socket.nsp.name}`);
        if (!sessionId)
            throw new Error(`Session is not defined`);
        await SessionService.updateStatus(sessionId, "STOPPED");
        // stop transcript
        try {
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
    socket.on('disconnect', async (reason) => {
        console.log(`Control io disconnected for client-> ${socket.id}, namespace-> ${socket.nsp.name} reason-> ${reason}`);
        if (sessionId) {
            await SessionService.endSession(sessionId);
        }
    });
    socket.on('transcriptReady', async (data) => {
        const { serviceCode, transcript } = data;
        // Let all observers know that a new transcript is available
        //        console.log(`Received a transcriptReady message`);
        const transciptData = { serviceCode, transcript, serviceLanguageMap };
        transcriptAvailServiceSub.next(transciptData);
        try {
            // write it to the DB
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
    socket.on('monitor', async (data) => {
        const { serviceId } = data;
        console.log(`Control is monitoring ${serviceId}`);
        // Start a new session
        sessionId = await SessionService.startNewSession(tenantId, serviceId);
        socket.join(serviceId);
        // Start up our transcript listerner for this service code
        const listenerData = { io: socketIoServer, serviceId, serviceLanguageMap, serviceSubscriptionMap, tenantId };
        registerForServiceTranscripts(listenerData);
        roomEmitter.on('subscriptionChange', (service) => {
            console.log(`New room emitter listener.  Listener count now: ${roomEmitter.listenerCount('subscriptionChange')}`);
            if (process.env.EXTRA_DEBUGGING)
                console.log(`Detected subscription change for service: ${service}`);
            const room = service;
            const jsonString = getActiveLanguages(clientConnection, service);
            clientConnection.emit(room, jsonString);
            if (process.env.EXTRA_DEBUGGING)
                console.log(`Attempting to emit: ${JSON.stringify(jsonString, null, 2)} to control room: ${room}`);
        });
    });
    socket.on('heartbeat', (data) => {
        const { serviceCode, status } = data;
        streamingStatusMap.set(serviceCode, status);
        // Send the heartbeat out to all subscribers in this service
        if (status == "livestreaming") {
            const room = `${serviceCode}:heartbeat`;
            clientConnection.to(room).emit('livestreaming');
        }
        // Send back the current subscriber list
        const jsonString = getActiveLanguages(clientConnection, serviceCode);
        controlConnection.emit('subscribers', jsonString);
    });
};
