import { getRoomsForAllClients, getSubscribersInAllRooms, getSubscribersInRoom } from "../services/room.service.js";
export const subscribersInRoomController = async (req, res) => {
    const serviceResponse = await getSubscribersInRoom(req.params.roomId);
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
export const subscribersInAllRoomsController = async (req, res) => {
    const serviceResponse = await getSubscribersInAllRooms();
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
export const roomsForAllClientsController = async (req, res) => {
    const serviceResponse = await getRoomsForAllClients();
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
