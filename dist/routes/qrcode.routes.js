import { Router } from "express";
import { QrCodeController } from "../controllers/qrcode.controller.js";
import { authentication } from "../middleware/authentication.middleware.js";
const router = Router();
// Payload
// { "serviceId": string }
//
router.post('/generate', authentication, QrCodeController.generateCode);
export default router;
