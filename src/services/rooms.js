import { roomSubscriptionMap, streamingStatusMap } from "../repositories/index.js";

//tbdexport const getSubscribersInRoom = ({ id: roomId }) => {
//tbd    try {
//tbd        const clients = io.sockets.adapter.rooms.get(roomId).size;
//tbd        res.json({ clients: clients });
//tbd    } catch (error) {
//tbd        console.log(`Error getting subscribers: ${error}`);
//tbd        res.json({ clients: "0" });
//tbd    }
//tbd}

export const getSubscribersInAllRooms = () => {
    try {
        let subscriberString = {};
        for (const [key, value] of roomSubscriptionMap.entries()) {
            subscriberString[key] = value;
        }
        return {
            success: true,
            statusCode: 200,
            message: `Subscriber List`,
            responseObject: {
                subscribers: subscriberString
            }
        }
    } catch (error) {
        console.log(`Error getting subscribers: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Error getting subscriber list`,
            responseObject: {
                subscribers: "0" 
            }
        }
    }
};

export const getStreamingStatus = (serviceId) => {
    try {
        const streamingStatus = streamingStatusMap.get(serviceId);
        return {
            success: true,
            statusCode: 200,
            message: `Streaming Status for service ${serviceId}`,
            responseObject: {
                status: streamingStatus
            }
        }
    } catch (error) {
        console.error(`ERROR getting streaming status: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Failed to get Streaming Status for service ${serviceId}`,
            responseObject: {
                error: error
            }
        }
    }
}