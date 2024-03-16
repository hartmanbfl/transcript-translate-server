import { Request, Response } from "express";
import { TranscriptService } from "../services/transcript.service.js";
import { CustomRequest, TokenInterface } from "../types/token.types.js";

export class TranscriptController {
    static async getFullTranscript(req: Request, res: Response) {
        const { id } = req.params;
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await TranscriptService.generateFullTranscript(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }    
    static async getLastTranscript(req: Request, res: Response) {
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await TranscriptService.getLastTranscript(jwt.tenantId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }    
    static async getBySession(req: Request, res: Response) {
        const { sessionId } = req.params;
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await TranscriptService.getBySessionId(sessionId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }    
    static async deleteEmptyTranscripts(req: Request, res: Response) {
        const serviceResponse = await TranscriptService.deleteEmptyTranscripts();
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
    static async search(req: Request, res: Response) {
        const jwt = (req as CustomRequest).token as TokenInterface;

        try {
            const partialQuery: TranscriptSearchCriteria = req.body;
            console.log(`partial query: ${partialQuery}`);
            const serviceResponse = await TranscriptService.search(jwt.tenantId, partialQuery);
            res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
        } catch (error) {
            console.log(`Error: ${error}`);
            res.status(400).json({ error: 'Error processing request'});
        }
        
    }
} 