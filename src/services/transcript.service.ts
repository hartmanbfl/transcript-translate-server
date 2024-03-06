import { AppDataSource } from "../data-source.js";
import { Phrase } from "../entity/Phrase.entity.js";
import { Tenant } from "../entity/Tenant.entity.js";
import { Transcript } from "../entity/Transcript.entity.js";

export class TranscriptService {
    static async addPhrase(transcript: Transcript, phrase_text: string, tenant_id: string ) {
        try {
            const phraseRepository = AppDataSource.getRepository(Phrase);
            const phrase = new Phrase();
            phrase.phrase_text = phrase_text;
            phrase.tenant_id = tenant_id;
            phrase.transcript_id = transcript.id;
            phrase.phrase_number = transcript.message_count;
            phrase.transcript = transcript;
            await phraseRepository.save(phrase);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    static async startTranscript(tenant: Tenant, serviceId: string) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcript = new Transcript();
            transcript.tenant = tenant;
            transcript.service_id = serviceId;
            transcript.message_count = 0;
            transcript.status = "STARTED";
            const newTranscript = await transcriptRepository.save(transcript)
            return newTranscript.id;
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    static async stopTranscript(transcriptId: string) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcript = await transcriptRepository.findOne({where: {id: transcriptId}});
            if (!transcript) throw new Error(`Transcript not found`);
            transcript.status = "ENDED";
            await transcriptRepository.save(transcript);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    static async getActiveTranscript(tenant: Tenant, serviceId: string) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            //console.log(`Looking for serviceId: ${serviceId}, tenantId: ${tenant.id}`)
            const transcripts = await transcriptRepository.find({
                relations: {
                    tenant: true
                },
                where: [
                    { status: "STARTED", service_id: serviceId },
                    { status: "IN_PROGRESS", service_id: serviceId}]
            });
            //console.log(`Found ${transcripts.length} transcripts`);
            if (transcripts.length === 1) {
                return transcripts[0]; 
            } else {
                throw new Error(`More than one active transcript for this service!`);
            }
        } catch (error) {
            console.log(`Error: ${error}`);
            return null;
        }
    }
    static async incrementMessageCount(transcriptId: string) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcript = await transcriptRepository.findOne({where: {id: transcriptId}});
            if (!transcript) throw new Error(`Transcript not found!`);

            transcript.message_count++;
            await transcriptRepository.save(transcript);
            return transcript.message_count;

        } catch (error) {
            console.log(`Error: ${error}`);
            return 0;
        }
    }
}