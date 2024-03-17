import { Request, Response } from "express";
import { RoomService } from "../services/room.service.js";

export class RoomController {
    static async getSubscribers(req: Request, res: Response) {
        const { roomId } = req.params;
        const tenantId = req.query.tenantId as string;
        const serviceResponse = await RoomService.getSubscribersInRoom(roomId, tenantId);

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getSubscribersInAllRooms(req: Request, res: Response) {
        const serviceResponse = await RoomService.getSubscribersInAllRooms();

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    };
    static async getRoomsForAllClients(req: Request, res: Response) {
        const serviceResponse = await RoomService.getRoomsForAllClients();

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
}

