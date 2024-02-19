import { Request, Response } from "express";
import { getRoomsForAllClients, getSubscribersInAllRooms, getSubscribersInRoom } from "../services/room.js";

export const subscribersInRoomController = async(req: Request, res: Response) => {
    const serviceResponse = await getSubscribersInRoom(req.params.roomId);

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}

export const subscribersInAllRoomsController = async (req: Request, res: Response) => {
    const serviceResponse = await getSubscribersInAllRooms();

    res.status(serviceResponse.statusCode).json({...serviceResponse});
};

export const roomsForAllClientsController = async (req: Request, res: Response) => {
    const serviceResponse = await getRoomsForAllClients();

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}


