// Helper function to split the room into <serviceId:language>
export var parseRoom = function (room) {
    var roomArray = room.split(":");
    var serviceId = roomArray[0];
    var language = roomArray[1];
    return {
        serviceId: serviceId,
        language: language
    };
};
