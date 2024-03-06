import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { TranscriptController } from "../controllers/transcript.controller.js";

const router = Router()

router.get("/:id", authentication, authorization(["superadmin", "admin"]), TranscriptController.getFullTranscript);

export default router;