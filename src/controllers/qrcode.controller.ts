import { Request, Response } from "express";
import { generateQR } from "../services/qrcode.service.js";
import { CustomRequest, TokenInterface } from "../types/token.types.js";

export class QrCodeController {
    static async generateCode(req: Request, res: Response) {
        const { serviceId } = req.body;
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await generateQR(serviceId, jwt.tenantId);

        res.status(serviceResponse.statusCode).json({...serviceResponse});
    } 
}