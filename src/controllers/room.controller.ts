import { Request, Response } from "express";
import { getRoomsForAllClients, getSubscribersInAllRooms, getSubscribersInRoom } from "../services/room.service.js";

export class RoomController {
    static async getSubscribers(req: Request, res: Response) {
        const { roomId } = req.params;
        const tenantId = req.query.tenantId as string;
        const serviceResponse = await getSubscribersInRoom(roomId, tenantId);

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getSubscribersInAllRooms(req: Request, res: Response) {
        const serviceResponse = await getSubscribersInAllRooms();

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    };
    static async getRoomsForAllClients(req: Request, res: Response) {
        const serviceResponse = await getRoomsForAllClients();

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
}

