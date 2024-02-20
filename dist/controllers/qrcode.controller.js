import { generateQR } from "../services/qrcode.service.js";
export const qrCodeController = async (req, res) => {
    const serviceResponse = await generateQR(req.body.serviceId);
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
