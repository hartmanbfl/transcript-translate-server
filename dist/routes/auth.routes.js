import { Router } from "express";
import { loginController, logoutController } from "../controllers/auth.controller.js";
import bodyParser from 'body-parser';
const router = Router();
router.get("/", (req, res) => {
    res.send("OK auth");
});
router.post("/login", bodyParser.urlencoded({ extended: true }), loginController);
router.post("/logout", logoutController);
export default router;
