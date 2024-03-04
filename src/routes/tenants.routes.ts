import { Router } from "express";
import { TenantController } from "../controllers/tenant.controller.js";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";

import  multer from 'multer';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({storage});


// Authenticate and authorize all requests
router.use(async (req, res, next) => {
    next();
});

router.get("/", authentication, authorization(["superadmin"]), TenantController.getAllTenants);
router.get("/:id", authentication, authorization(["superadmin","admin"]), TenantController.getTenant);
router.get("/:id/themeId", authentication, authorization(["superadmin","admin"]), TenantController.getThemeId);

router.post("/create", authentication, authorization(["superadmin"]), TenantController.addTenant);

router.post("/getByName", authentication, authorization(["superadmin"]), TenantController.getTenantIdByName);
router.post("/getByKey", authentication, authorization(["superadmin","admin"]), TenantController.getTenantIdByKey);

router.post("/:id/theme", authentication, authorization(["superamdin","admin"]), TenantController.addTheming);

export default router;