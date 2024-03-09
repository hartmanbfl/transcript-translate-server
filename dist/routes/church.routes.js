import { Router } from "express";
import { ChurchController } from "../controllers/church.controller.js";
import { authentication } from "../middleware/authentication.middleware.js";
import { authorization } from "../middleware/authorization.middleware.js";
const router = Router();
router.get("/", (req, res) => {
    res.send("OK church");
});
router.get("/info", authentication, ChurchController.getServiceInfo);
router.get("/configuration", authentication, ChurchController.getConfigration);
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
router.post("/configuration", authentication, authorization(["admin"]), ChurchController.setConfiguration);
export default router;
