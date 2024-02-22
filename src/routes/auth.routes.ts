import { Router } from "express";
import { AuthenticationController } from "../controllers/auth.controller.js";
import bodyParser from 'body-parser';

const router = Router()

router.get("/", (req, res) => {
    res.send("OK auth");
})
router.post("/login", bodyParser.urlencoded({ extended: true }), AuthenticationController.login);
router.post("/logout", AuthenticationController.logout);

export default router;