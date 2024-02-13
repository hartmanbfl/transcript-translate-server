import { generateQR } from "../services/qrcode.js";

export const qrCodeController = async (req, res) => {    
    const serviceResponse = await generateQR(req.body);

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}