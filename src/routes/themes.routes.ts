import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { ThemeController } from "../controllers/theme.controller.js";

import  multer from 'multer';

const router = Router();

// Set up file storage (for the logos)
const storage = multer.memoryStorage();
const upload = multer({storage});


router.get('/', authentication, authorization(["admin"]), ThemeController.getTenantTheme);
router.get('/:id', ThemeController.getTheme);
router.put('/:id', authentication, authorization(["superadmin","admin"]),ThemeController.update);

// Church logo calls
router.post("/:id/uploadLogo", upload.single('logo'), ThemeController.uploadLogo);


export default router;