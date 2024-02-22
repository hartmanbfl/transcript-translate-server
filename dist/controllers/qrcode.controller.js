import { generateQR } from "../services/qrcode.service.js";
export class QrCodeController {
    static async generateCode(req, res) {
        const serviceResponse = await generateQR(req.body.serviceId);
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
}
