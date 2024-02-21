import { Router } from "express";
import { ChurchController } from "../controllers/church.controller.js";

const router = Router()

router.get("/", (req, res) => {
    res.send("OK church");
})

router.get("/info", ChurchController.getServiceInfo); 
router.get("/configuration", ChurchController.getConfigration);

// Check whether the church service with the given ID is available
router.get("/:serviceId/status", ChurchController.getStatus);

// Chech whether the church service with the given ID is livestreaming
// Example JSON ResponseObject :
// {
//   "status": "offline"
// }
router.get("/:serviceId/livestreaming", ChurchController.getLivestreamStatus);

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
router.get("/:serviceId/languages", ChurchController.getLanguages);
    
export default router;