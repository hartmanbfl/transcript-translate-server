import * as dotenv from 'dotenv';
dotenv.config();
export var getDeepgramApiKey = function () {
    return process.env.DEEPGRAM_API_KEY;
};
export var getDeepgramProjectId = function () {
    return process.env.DEEPGRAM_PROJECT;
};
