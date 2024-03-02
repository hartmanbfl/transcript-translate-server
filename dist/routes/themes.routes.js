import { Router } from "express";
import { ThemeController } from "../controllers/theme.controller.js";
const router = Router();
router.get('/:id', ThemeController.getTheme);
router.put('/:id', ThemeController.update);
export default router;
