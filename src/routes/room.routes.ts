import { Router } from "express";
import { subscribersInAllRoomsController, subscribersInRoomController } from "../controllers/room.controller.js";

const router = Router()


// API Calls for getting information about the subscribers

// Get all the subscribers in a specific room (Room = serviceId:lang)
// Example query param : 
//   5555:de or 33:transcript
// Example Respons JSON:
// {
//   "clients": 2
// }
router.get('/:roomId/subscribers', subscribersInRoomController); 

// Get all the subscribers in all the rooms
// Example JSON:
// {
//   "1234:de": [
//     "cENBYw_9R2EsjIe_AAAN"
//   ],
//   "1234:transcript": [
//     "cENBYw_9R2EsjIe_AAAN",
//     "MH_fui-MF6bG4kcdAAAR"
//   ],
//   "1234:uk": [
//     "MH_fui-MF6bG4kcdAAAR"
//   ]
// }
router.get('/subscribers', subscribersInAllRoomsController);

export default router;