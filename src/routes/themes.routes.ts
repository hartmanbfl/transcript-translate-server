import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { ThemeController } from "../controllers/theme.controller.js";

const router = Router();

router.get('/:id', ThemeController.getTheme);
router.put('/:id', authentication, authorization(["admin"]),ThemeController.update);

export default router;