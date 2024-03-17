import { RoomService } from "../services/room.service.js";
export class RoomController {
    static async getSubscribers(req, res) {
        const { roomId } = req.params;
        const tenantId = req.query.tenantId;
        const serviceResponse = await RoomService.getSubscribersInRoom(roomId, tenantId);
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getSubscribersInAllRooms(req, res) {
        const serviceResponse = await RoomService.getSubscribersInAllRooms();
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    ;
    static async getRoomsForAllClients(req, res) {
        const serviceResponse = await RoomService.getRoomsForAllClients();
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
}
