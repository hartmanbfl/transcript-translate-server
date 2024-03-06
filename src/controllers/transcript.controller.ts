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
} 