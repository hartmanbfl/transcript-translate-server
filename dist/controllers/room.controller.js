import { getRoomsForAllClients, getSubscribersInAllRooms, getSubscribersInRoom } from "../services/room.service.js";
export class RoomController {
    static async getSubscribers(req, res) {
        const serviceResponse = await getSubscribersInRoom(req.params.roomId);
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getSubscribersInAllRooms(req, res) {
        const serviceResponse = await getSubscribersInAllRooms();
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    ;
    static async getRoomsForAllClients(req, res) {
        const serviceResponse = await getRoomsForAllClients();
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
}
