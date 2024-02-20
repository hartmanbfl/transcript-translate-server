import * as dotenv from 'dotenv';
dotenv.config();
export const getDeepgramApiKey = () => {
    return process.env.DEEPGRAM_API_KEY;
};
export const getDeepgramProjectId = () => {
    return process.env.DEEPGRAM_PROJECT;
};
