import * as dotenv from 'dotenv';
dotenv.config();
export const getFirebaseApiKey = () => {
    return process.env.FIREBASE_API_KEY;
};
