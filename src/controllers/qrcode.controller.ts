import { Request, Response } from "express";
import { generateQR } from "../services/qrcode.service.js";

export const qrCodeController = async (req: Request, res: Response) => {    
    const serviceResponse = await generateQR(req.body.serviceId);

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}