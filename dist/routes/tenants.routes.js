import { Router } from "express";
import { TenantController } from "../controllers/tenant.controller.js";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
const router = Router();
router.get("/", (req, res) => {
    res.send("OK tenants");
});
router.get(":/id", authentication, authorization(["admin"]), TenantController.getTenant);
router.post("/create", authentication, authorization(["admin"]), TenantController.addTenant);
router.post("/getByName", authentication, authorization(["admin"]), TenantController.getTenantIdByName);
export default router;
