import { Router } from "express";
import { DeepgramController } from "../controllers/deepgram.controller.js";
const router = Router();
// Middleware if needed 
router.use((req, res, next) => {
    next();
});
router.get("/", (req, res) => {
    res.send("OK deepgram");
});
// Auth handler for keys from deepgram.  This is the method that triggers the server
// to start listening for client subscriptions.
// Example Payload Body
//{
//    "serviceId": "5555",
//    "churchKey": "NEFC"
//}
router.post("/auth", DeepgramController.authorize);
export default router;
