import { Router } from "express";
import { QrCodeController } from "../controllers/qrcode.controller.js";

const router = Router()

// Payload
// { "serviceId": string }
//
router.post('/generate', QrCodeController.generateCode);

export default router;