import { createClient} from "@deepgram/sdk";
import { getChurchSecretKey } from "../repositories/church.js";
import { getDeepgramApiKey, getDeepgramProjectId } from "../repositories/deepgram.js";

const deepgram = createClient(getDeepgramApiKey());

export const authService = async ({ serviceId, churchKey }) => {
    try {
        console.log(`The service code is: ${serviceId}`);
        if (churchKey != getChurchSecretKey()) {
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
        const keyResult = await deepgram.manage.createProjectKey(getDeepgramProjectId(),
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
                deepgramToken: keyResult.result.key
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