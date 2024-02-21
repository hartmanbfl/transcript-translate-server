import { Router } from "express";
import { RoomController } from "../controllers/room.controller.js";
const router = Router();
// Get the list of rooms for each client connection (i.e. client socket ID)
// Example JSON:
// {
//   "cENBYw_9R2EsjIe_AAAN": [
//     "1234:de",
//     "1234:transcript"
//   ],
//   "MH_fui-MF6bG4kcdAAAR": [
//     "1234:uk",
//     "1234:transcript"
//   ]
// }
router.get("/rooms", RoomController.getRoomsForAllClients);
export default router;
