import * as dotenv from 'dotenv';
dotenv.config();
export var getFirebaseApiKey = function () {
    return process.env.FIREBASE_API_KEY;
};
