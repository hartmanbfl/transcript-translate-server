import { Router } from "express";
import { configurationController, infoController, livestreamController, statusController } from "../controllers/church.js";

const router = Router()

router.get("/", (req, res) => {
    res.send("OK church");
})

router.get("/info", infoController); 
router.get("/configuration", configurationController);

// Check whether the church service with the given ID is available
router.get("/:serviceId/status", statusController);

// Chech whether the church service with the given ID is livestreaming
// Example JSON:
// {
//   "status": "offline"
// }
router.get("/:serviceId/livestreaming", livestreamController);
    
export default router;