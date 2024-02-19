import { createClient} from "@deepgram/sdk";
import { getChurchSecretKey } from "../repositories/church.js";
import { getDeepgramApiKey, getDeepgramProjectId } from "../repositories/deepgram.js";

const deepgram = getDeepgramApiKey() != undefined ? createClient(getDeepgramApiKey()!) : null;

export interface DeepgramAuth {
    'serviceId': string,
    'churchKey': string
}

export const authService = async (payload: DeepgramAuth) => {
    try {
        if (deepgram == null) throw new Error('Deepgram service is undefined');
        console.log(`The service code is: ${payload.serviceId}`);
        if (payload.churchKey != getChurchSecretKey()) {
            return {
                success: false,
                statusCode: 400,
                message: `Key is missing or incorrect`,
                responseObject: {
                    error: 'Key is missing or incorrect'
                }
            }
        }

        // Get a Token used for making the Websocket calls in the front end
        const keyResult = await deepgram.manage.createProjectKey(getDeepgramProjectId()!,
            {
                comment: "Temporary key - works for 10 secs",
                scopes: ["usage:write"],
                time_to_live_in_seconds: 10
            })
        return {
            success: true,
            statusCode: 200,
            message: 'Successfully obtained deepgram token',
            responseObject: {
                deepgramToken: keyResult?.result?.key
            }
        }
    } catch (error) {
        console.error(`Caught error in auth: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Key is missing or incorrect`,
                responseObject: {
                    error: `${error}` 
                }
            }
    }
}