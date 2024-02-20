// Helper function to split the room into <serviceId:language>
export const parseRoom = (room) => {
    const roomArray = room.split(":");
    const serviceId = roomArray[0];
    const language = roomArray[1];
    return {
        serviceId: serviceId,
        language: language
    };
};
