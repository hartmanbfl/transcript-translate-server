import { Router } from "express";
import { qrCodeController } from "../controllers/qrcode.js";
const router = Router();
// Payload
// { "serviceId": string }
//
router.post('/generate', qrCodeController);
export default router;
