import { TranscriptService } from "../services/transcript.service.js";
export class TranscriptController {
    static async getFullTranscript(req, res) {
        const { id } = req.params;
        const jwt = req.token;
        const serviceResponse = await TranscriptService.generateFullTranscript(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
    static async getLastTranscript(req, res) {
        const jwt = req.token;
        const serviceResponse = await TranscriptService.getLastTranscript(jwt.tenantId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
    static async deleteEmptyTranscripts(req, res) {
        const serviceResponse = await TranscriptService.deleteEmptyTranscripts();
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
    static async search(req, res) {
        const jwt = req.token;
        try {
            const partialQuery = req.body;
            console.log(`partial query: ${partialQuery}`);
            const serviceResponse = await TranscriptService.search(jwt.tenantId, partialQuery);
            res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
        }
        catch (error) {
            console.log(`Error: ${error}`);
            res.status(400).json({ error: 'Error processing request' });
        }
    }
}
