import { Request, Response } from "express";
import { SessionService } from "../services/session.service.js";
import { CustomRequest, TokenInterface } from "../types/token.types.js";

export class SessionController {
    static async deleteEmptySessions(req: Request, res: Response) {
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await SessionService.deleteEmptySessions(jwt.tenantId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
}