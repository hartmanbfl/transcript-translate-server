import { Router } from "express";
import { qrCodeController } from "../controllers/qrcode.js";
var router = Router();
// Payload
// { "serviceId": string }
//
router.post('/generate', qrCodeController);
export default router;
