import { generateQR } from "../services/qrcode.service.js";
export class QrCodeController {
    static async generateCode(req, res) {
        const { serviceId } = req.body;
        const jwt = req.token;
        const serviceResponse = await generateQR(serviceId, jwt.tenantId);
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
}
