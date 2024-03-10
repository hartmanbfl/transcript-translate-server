import * as dotenv from 'dotenv';
import { roomEmitter, transcriptAvailServiceSub } from "../../globals.js";
import { registerForServiceTranscripts } from "../../translate.js";
import { getActiveLanguages } from '../../services/church.service.js';
import { serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from '../../repositories/index.repository.js';
import { Namespace, Server, Socket } from 'socket.io';
import { TranscriptService } from '../../services/transcript.service.js';
import { TenantService } from '../../services/tenant.service.js';
import { Tenant } from '../../entity/Tenant.entity.js';
import { Transcript } from '../../entity/Transcript.entity.js';

// Environment variables
dotenv.config();

export const registerControlHandlers = (controlIo: Namespace, clientIo: Server, socket: Socket) => {

    console.log(`Registering ${socket.id} connected to our socket.io control namespace`);

    socket.on('recordingStarted', async (data) => {
        const { serviceCode } = data;
        console.log(`Recording started for ${serviceCode}`)

        // Make sure no translations are happening for this tenant
        const tenant: Tenant | null = (await TenantService.getTenantByChurchKey("GDOT")).responseObject.tenant;
        if (tenant) {

            await TranscriptService.stopAllTranscripts(tenant.id, serviceCode);

            // start a new transcript
            const transcriptId = await TranscriptService.startTranscript(tenant!, serviceCode);
        }

    });
    socket.on('recordingStopped', async (data) => {
        const { serviceCode } = data;
        console.log(`Recording stopped for ${serviceCode}`)

        // stop transcript
        try {
            const tenant: Tenant | null = (await TenantService.getTenantByChurchKey("GDOT")).responseObject.tenant;
            if (!tenant) throw new Error(`Tenant not found for this church key`);

            const transcript: Transcript | null = await TranscriptService.getActiveTranscript(tenant.id, serviceCode);
            if (!transcript) throw new Error(`No active transcript found`);

            await TranscriptService.stopTranscript(transcript.id);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    });

    socket.on('disconnect', (reason) => {
        console.log(`Control io disconnected for client-> ${socket.id}, reason-> ${reason}`);
    });
    socket.on('transcriptReady', async (data) => {
        const { serviceCode, transcript } = data;

        // Let all observers know that a new transcript is available
        //        console.log(`Received a transcriptReady message`);
        const transciptData = { serviceCode, transcript, serviceLanguageMap };
        transcriptAvailServiceSub.next(transciptData);

        try {
            // write it to the DB
            const tenant: Tenant | null = (await TenantService.getTenantByChurchKey("GDOT")).responseObject.tenant;
            if (!tenant) throw new Error(`Tenant not found for this church key`);
            const transcriptEntity = await TranscriptService.getActiveTranscript(tenant.id, serviceCode);
            if (!transcriptEntity) throw new Error(`No active transcript found`);

            const messageCount = await TranscriptService.incrementMessageCount(transcriptEntity.id);
            await TranscriptService.addPhrase(transcriptEntity, transcript, tenant.id);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
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
            console.log(`New room emitter listener.  Listener count now: ${roomEmitter.listenerCount('subscriptionChange')}`);
            if (process.env.EXTRA_DEBUGGING) console.log(`Detected subscription change for service: ${service}`);
            const jsonString = getActiveLanguages(clientIo, service);
            const room = service;

            if (process.env.EXTRA_DEBUGGING) console.log(`Attempting to emit: ${JSON.stringify(jsonString, null, 2)} to control room: ${room}`);
            socket.emit(room, jsonString);
        })
    })
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
    })
}