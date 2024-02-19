import * as dotenv from 'dotenv';
dotenv.config();

export const getDeepgramApiKey = () : string | undefined => {
    return process.env.DEEPGRAM_API_KEY;
}
export const getDeepgramProjectId = () : string | undefined => {
    return process.env.DEEPGRAM_PROJECT;
}