import { Router } from "express";
import { loginController, logoutController } from "../controllers/auth.js";
import bodyParser from 'body-parser';
var router = Router();
router.get("/", function (req, res) {
    res.send("OK auth");
});
router.post("/login", bodyParser.urlencoded({ extended: true }), loginController);
router.post("/logout", logoutController);
export default router;
