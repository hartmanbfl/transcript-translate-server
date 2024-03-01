import { Router } from "express";
import { TenantController } from "../controllers/tenant.controller.js";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";

import  multer from 'multer';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({storage});

router.get("/", (req, res) => {
    res.send("OK tenants");
})

// Authenticate and authorize all requests
router.use(async (req, res, next) => {
    next();
});

router.get("/:id", authentication, authorization(["admin"]), TenantController.getTenant);

router.post("/create", authentication, authorization(["admin"]), TenantController.addTenant);

router.post("/getByName", authentication, authorization(["admin"]), TenantController.getTenantIdByName);

//router.post("/uploadLogo", authentication, authorization(["user", "admin"]), upload.single('logo'), TenantController.uploadLogo);
router.post("/uploadLogo", upload.single('logo'), TenantController.uploadLogo);

export default router;