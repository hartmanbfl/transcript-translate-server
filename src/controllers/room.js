import { clientSubscriptionMap } from "../repositories/index.js";
import { getSubscribersInAllRooms, getSubscribersInRoom } from "../services/room.js";

export const subscribersInRoomController = async(req, res) => {
    const serviceResponse = await getSubscribersInRoom(req.params.roomId);

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}

export const subscribersInAllRoomsController = async (req, res) => {
    const serviceResponse = await getSubscribersInAllRooms();

    res.status(serviceResponse.statusCode).json({...serviceResponse});
};

// Get all the clients (unique ID) in all the rooms
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
export const getRoomsForAllClients = async (req, res) => {
    try {
        let subscriberString = {};
        for (const [key, value] of clientSubscriptionMap.entries()) {
            subscriberString[key] = value;
        }
        res.json(subscriberString);
    } catch (error) {
        console.log(`Error getting clients: ${error}`);
        res.json({ rooms: "0" });
    }
};

