import { Router } from "express";
import { configurationController, infoController, statusController } from "../controllers/church.js";

const router = Router()

router.get("/", (req, res) => {
    res.send("OK church");
})

router.get("/info", infoController); 
router.get("/configuration", configurationController);
router.get("/status", statusController);
    
export default router;