import { Router } from "express";
import { configurationController, infoController, languagesController, livestreamController, statusController } from "../controllers/church.controller.js";

const router = Router()

router.get("/", (req, res) => {
    res.send("OK church");
})

router.get("/info", infoController); 
router.get("/configuration", configurationController);

// Check whether the church service with the given ID is available
router.get("/:serviceId/status", statusController);

// Chech whether the church service with the given ID is livestreaming
// Example JSON ResponseObject :
// {
//   "status": "offline"
// }
router.get("/:serviceId/livestreaming", livestreamController);

// Get the current list of subscribed to languages
// Example JSON ResponsObject:
// { 
//    "serviceId":"5555",
//    "languages":[
//      {
//        "name":"Transcript",
//        "subscribers":1
//      },
//      {
//        "name":"uk",
//        "subscribers":1
//       }
//    ]
// }
router.get("/:serviceId/languages", languagesController);
    
export default router;