import { AppDataSource } from "../data-source.js";
import { Phrase } from "../entity/Phrase.entity.js";
import { Tenant } from "../entity/Tenant.entity.js";
import { Transcript } from "../entity/Transcript.entity.js";
import { DbService } from "./db.service.js";
export class TranscriptService {
    static async addPhrase(transcript, phrase_text, tenantId) {
        try {
            await this.updateStatus(transcript.id, "IN_PROGRESS");
            const phraseRepository = AppDataSource.getRepository(Phrase);
            const phrase = new Phrase();
            phrase.phrase_text = phrase_text;
            phrase.tenant_id = tenantId;
            phrase.transcript_id = transcript.id;
            phrase.phrase_number = transcript.message_count;
            phrase.transcript = transcript;
            await phraseRepository.save(phrase);
        }
        catch (error) {
            console.log(`Error in addPhrase: ${error}`);
        }
    }
    static async updateStatus(transcriptId, status) {
        try {
            await AppDataSource
                .getRepository(Transcript)
                .createQueryBuilder()
                .update(Transcript)
                .set({ status: status })
                .where("id = :transcriptId", { transcriptId })
                .execute();
        }
        catch (error) {
            console.log(`Error in updateStatus: ${this.updateStatus}`);
        }
    }
    static async startTranscript(tenantId, serviceId) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const tenant = await AppDataSource
                .getRepository(Tenant)
                .findOne({ where: { id: tenantId } });
            if (!tenant)
                throw new Error(`Tenant not found for this tenant ID`);
            const transcript = new Transcript();
            transcript.tenant = tenant;
            transcript.service_id = serviceId;
            transcript.message_count = 0;
            transcript.status = "STARTED";
            const newTranscript = await transcriptRepository.save(transcript);
            return newTranscript.id;
        }
        catch (error) {
            console.log(`Error in startTranscript: ${error}`);
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
            console.log(`Error in stopTranscript: ${error}`);
        }
    }
    static async stopAllTranscripts(tenantId, serviceId) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcripts = await transcriptRepository
                .createQueryBuilder('transcript')
                .innerJoinAndSelect('transcript.tenant', 'tenant')
                .where('tenant.id = :tenantId', { tenantId })
                .andWhere('service_id = :serviceId', { serviceId })
                .andWhere('status IN (:...statuses)', { statuses: ['STARTED', 'IN_PROGRESS'] })
                .getMany();
            if (!transcripts)
                return;
            transcripts.forEach(async (transcript) => {
                transcript.status = "ENDED";
                await transcriptRepository.save(transcript);
            });
        }
        catch (error) {
            console.log(`Error in stopAllTranscripts: ${error}`);
        }
    }
    static async getActiveTranscript(tenantId, serviceId) {
        try {
            const transcripts = await AppDataSource
                .getRepository(Transcript)
                .createQueryBuilder('transcript')
                .innerJoinAndSelect('transcript.tenant', 'tenant')
                .where('tenant.id = :tenantId', { tenantId })
                .andWhere('transcript.service_id = :serviceId', { serviceId })
                .andWhere('status IN (:...statuses)', { statuses: ['STARTED', 'IN_PROGRESS'] })
                .getMany();
            if (transcripts.length === 1) {
                return transcripts[0];
            }
            else {
                transcripts.forEach(transcript => {
                    console.log(`Transcript: id-> ${transcript.id}, status-> ${transcript.status}`);
                });
                throw new Error(`More than one active transcript for this service!`);
            }
        }
        catch (error) {
            console.log(`Error in getActiveTranscript: ${error}`);
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
