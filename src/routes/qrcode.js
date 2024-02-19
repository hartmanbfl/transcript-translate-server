import { Router } from "express";
import { qrCodeController } from "../controllers/qrcode.js";

const router = Router()

router.post('/generate', qrCodeController);

export default router;