import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { SessionController } from "../controllers/session.controller.js";

const router = Router()

router.delete("/empty", authentication, authorization(["superadmin", "admin"]), SessionController.deleteEmptySessions);

export default router;