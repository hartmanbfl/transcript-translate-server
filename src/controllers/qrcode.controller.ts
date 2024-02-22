import { Request, Response } from "express";
import { generateQR } from "../services/qrcode.service.js";

export class QrCodeController {
    static async generateCode(req: Request, res: Response) {
        const serviceResponse = await generateQR(req.body.serviceId);

        res.status(serviceResponse.statusCode).json({...serviceResponse});
    } 
}