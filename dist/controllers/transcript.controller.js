import { TranscriptService } from "../services/transcript.service.js";
export class TranscriptController {
    static async getFullTranscript(req, res) {
        const { id } = req.params;
        const jwt = req.token;
        const serviceResponse = await TranscriptService.generateFullTranscript(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
}
