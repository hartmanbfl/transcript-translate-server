import { Router } from "express";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
import { UserController } from "../controllers/user.controller.js";
import { ApiAuthController } from "../controllers/auth.controller.js";

const router = Router()

router.get("/", authentication, authorization(["superadmin","admin"]), UserController.getUsers);
router.post("/login", ApiAuthController.login);
router.post("/create", authentication, authorization(["superadmin","admin"]), UserController.createUser);

router.delete('/:id', authentication, authorization(["superadmin","admin"]), UserController.deleteUser);

export default router;