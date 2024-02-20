import { Router } from "express";
import { authController } from "../controllers/deepgram.controller.js";

const router = Router()

// Middleware if needed 
router.use((req, res, next) => {
    next();
});

router.get("/", (req, res) => {
    res.send("OK deepgram");
})

// Auth handler for keys from deepgram.  This is the method that triggers the server
// to start listening for client subscriptions.
router.post("/auth", authController);

export default router;