import { Router } from "express";
import { subscribersInAllRoomsController } from "../controllers/room.js";

const router = Router()


// API Calls for getting information about the subscribers

// Get all the subscribers in a specific room (Room = serviceId:lang)
// Example JSON:
// {
//   "clients": 2
// }
//TBD router.get('/:roomId/subscribersInRoom', subscribersInRoomController); 

// Check if a particular service is livestreaming or not
// Example JSON:
// {
//   "status": "offline"
// }
//router.get('/:serviceId/streamingstatus', streamingStatusController);

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