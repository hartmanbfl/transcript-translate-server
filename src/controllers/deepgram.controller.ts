import { Request, Response } from "express";
import { authService } from "../services/deepgram.service.js"

export class DeepgramController {
    static async authorize(req: Request, res: Response) {
        const serviceResponse = await authService(req.body);

        res.status((await serviceResponse).statusCode).json({ ...serviceResponse });
    }
}