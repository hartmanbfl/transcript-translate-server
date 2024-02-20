import { Router } from "express";
import { qrCodeController } from "../controllers/qrcode.controller.js";
const router = Router();
// Payload
// { "serviceId": string }
//
router.post('/generate', qrCodeController);
export default router;
