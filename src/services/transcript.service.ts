import { AppDataSource } from "../data-source";
import { Phrase } from "../entity/Phrase.entity";
import { Tenant } from "../entity/Tenant.entity";
import { Transcript } from "../entity/Transcript.entity";

export class TranscriptService {
    static async addPhrase(transcript_id: string, phrase_text: string ) {
        try {
            const phraseRepository = AppDataSource.getRepository(Phrase);
            const phrase = new Phrase();
            phrase.phrase_text = phrase_text;
            phrase.transcript_id = transcript_id;
            await phraseRepository.save(phrase);
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
    static async startTranscript(tenant: Tenant) {
        try {
            const transcriptRepository = AppDataSource.getRepository(Transcript);
            const transcript = new Transcript();
            transcript.tenant = tenant;
            const newTranscript = await transcriptRepository.save(transcript)
            return newTranscript.id;
        } catch (error) {
            console.log(`Error: ${error}`);
        }
    }
}