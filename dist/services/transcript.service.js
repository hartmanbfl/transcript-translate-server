import { AppDataSource } from "../data-source.js";
import { Phrase } from "../entity/Phrase.entity.js";
import { Transcript } from "../entity/Transcript.entity.js";
import { DbService } from "./db.service.js";
export class TranscriptService {
    static async addPhrase(transcript, phrase_text, tenant_id) {
        try {
            const phraseRepository = AppDataSource.getRepository(Phrase);
            const phrase = new Phrase();
            phrase.phrase_text = phrase_text;
            phrase.tenant_id = tenant_id;
            phrase.transcript_id = transcript.id;
            phrase.phrase_number = transcript.message_count;
            phrase.transcript = transcript;
            await phraseRepository.save(phrase);
        }
        catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    static async startTranscript(tenant, serviceId) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcript = new Transcript();
            transcript.tenant = tenant;
            transcript.service_id = serviceId;
            transcript.message_count = 0;
            transcript.status = "STARTED";
            const newTranscript = await transcriptRepository.save(transcript);
            return newTranscript.id;
        }
        catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    static async stopTranscript(transcriptId) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcript = await transcriptRepository.findOne({ where: { id: transcriptId } });
            if (!transcript)
                throw new Error(`Transcript not found`);
            transcript.status = "ENDED";
            await transcriptRepository.save(transcript);
        }
        catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    static async getActiveTranscript(tenant, serviceId) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            //console.log(`Looking for serviceId: ${serviceId}, tenantId: ${tenant.id}`)
            const transcripts = await transcriptRepository.find({
                relations: {
                    tenant: true
                },
                where: [
                    { status: "STARTED", service_id: serviceId },
                    { status: "IN_PROGRESS", service_id: serviceId }
                ]
            });
            //console.log(`Found ${transcripts.length} transcripts`);
            if (transcripts.length === 1) {
                return transcripts[0];
            }
            else {
                throw new Error(`More than one active transcript for this service!`);
            }
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return null;
        }
    }
    static async incrementMessageCount(transcriptId) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcript = await transcriptRepository.findOne({ where: { id: transcriptId } });
            if (!transcript)
                throw new Error(`Transcript not found!`);
            transcript.message_count++;
            await transcriptRepository.save(transcript);
            return transcript.message_count;
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return 0;
        }
    }
    static async generateFullTranscript(transcriptId) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcript = await transcriptRepository.findOne({
                relations: {
                    phrases: true
                },
                where: {
                    id: transcriptId
                }
            });
            if (!transcript)
                throw new Error(`Transcript not found with this ID`);
            // Sort the phrases and then add them to a string 
            const sortedPhrases = transcript.phrases.sort((a, b) => (a.phrase_number < b.phrase_number ? -1 : 1));
            let fullTranscript = "";
            sortedPhrases.forEach(phrase => {
                fullTranscript = fullTranscript + phrase.phrase_text + " ";
            });
            return {
                success: true,
                statusCode: 200,
                message: `Full transcript obtained successfully`,
                responseObject: fullTranscript
            };
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `${error}`,
                responseObject: ""
            };
        }
    }
    static async getLastTranscript(tenantId) {
        try {
            console.log(`TenantID: ${tenantId}`);
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcripts = await transcriptRepository
                .createQueryBuilder('transcript')
                .innerJoinAndSelect('transcript.tenant', 'tenant')
                .where('tenant.id = :tenantId', { tenantId })
                .orderBy('transcript.created_at', 'DESC')
                .limit(1)
                .getMany();
            transcripts.forEach(transcript => {
                console.log(`Found transcript with ID: ${transcript.id} and message count: ${transcript.message_count}`);
            });
            return {
                success: true,
                statusCode: 200,
                message: `Successfully obtained transcripts`,
                responseObject: transcripts
            };
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `${error}`,
                responseObject: []
            };
        }
    }
    static async search(tenantId, searchCriteria) {
        try {
            console.log(`TenantID: ${tenantId}`);
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const searchResults = await DbService.searchRecordsWithDateRange(tenantId, transcriptRepository, searchCriteria);
            return {
                success: true,
                statusCode: 200,
                message: `Successfully obtained transcripts`,
                responseObject: searchResults
            };
        }
        catch (error) {
            console.log(`Error: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `${error}`,
                responseObject: []
            };
        }
    }
}
