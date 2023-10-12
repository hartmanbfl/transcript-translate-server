const generateRandomPin = () => {
    return Math.floor(Math.random() * 900000 + 100000);
}

const printDeepgramState = (state) => {
    switch (state) {
        case 0:
            return "CONNECTING";
        case 1:
            return "OPEN";
        case 2:
            return "CLOSING";
        case 3:
            return "CLOSED";
        default:
            return "UNKNOWN";
    }
}