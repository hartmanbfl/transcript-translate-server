import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { TranscriptController } from "../controllers/transcript.controller.js";
const router = Router();
router.get("/lastTranscript", authentication, authorization(["admin"]), TranscriptController.getLastTranscript);
router.get("/:id", authentication, authorization(["superadmin", "admin"]), TranscriptController.getFullTranscript);
router.post("/search", authentication, authorization(["admin"]), TranscriptController.search);
export default router;
