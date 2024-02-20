import { getChurchAdditionalWelcome, getChurchDefaultServiceId, getChurchGreeting, getChurchLanguage, getChurchLogoBase64, getChurchMessage, getChurchName, getChurchServiceTimeout, getChurchTranslationLanguages, getChurchWaitingMessage } from '../repositories/church.repository.js';
import { serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from '../repositories/index.repository.js';
import { getClientIo } from './socketio.service.js';
export const infoService = () => {
    try {
        const churchName = getChurchName();
        const churchLogoBase64 = getChurchLogoBase64();
        const churchGreeting = getChurchGreeting();
        const churchMessage = getChurchMessage();
        const churchWaitingMessage = getChurchWaitingMessage();
        const churchAdditionalWelcome = getChurchAdditionalWelcome();
        const churchLang = getChurchLanguage();
        const defaultServiceId = getChurchDefaultServiceId();
        const translationLanguages = getChurchTranslationLanguages();
        return {
            success: true,
            statusCode: 200,
            message: `Info generated successfully`,
            responseObject: {
                name: churchName, defaultServiceId: defaultServiceId,
                greeting: churchGreeting,
                message: churchMessage, additionalWelcome: churchAdditionalWelcome,
                waiting: churchWaitingMessage,
                language: churchLang, translationLanguages: translationLanguages,
                base64Logo: churchLogoBase64
            }
        };
    }
    catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error getting church info`,
            responseObject: null
        };
    }
};
export const configurationService = () => {
    try {
        return {
            success: true,
            statusCode: 200,
            message: `Configuration generated successfully`,
            responseObject: {
                serviceTimeout: getChurchServiceTimeout(),
                churchName: getChurchName(),
                defaultServiceId: getChurchDefaultServiceId(),
                hostLanguage: getChurchLanguage()
            }
        };
    }
    catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error: ${error}`,
            responseObject: {
                error: error
            }
        };
    }
};
export const statusService = (serviceId) => {
    try {
        // See if this service ID exists in the service map
        const active = serviceSubscriptionMap.get(serviceId);
        if (process.env.EXTRA_DEBUGGING)
            console.log(`Checking if ${serviceId} exists in the serviceSubscriptionMap: ${active}`);
        return {
            success: true,
            statusCode: 200,
            message: `Service is currently ${active}`,
            responseObject: {
                active: active
            }
        };
    }
    catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error: ${error}`,
            responseObject: {
                error: error
            }
        };
    }
};
export const getLivestreamStatus = (serviceId) => {
    try {
        const streamingStatus = streamingStatusMap.get(serviceId);
        return {
            success: true,
            statusCode: 200,
            message: `Streaming Status for service ${serviceId}`,
            responseObject: {
                status: streamingStatus
            }
        };
    }
    catch (error) {
        console.error(`ERROR getting streaming status: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Failed to get Streaming Status for service ${serviceId}`,
            responseObject: {
                error: error
            }
        };
    }
};
export const getLanguages = (serviceId) => {
    try {
        const clientIo = getClientIo();
        const jsonString = getActiveLanguages(clientIo, serviceId);
        return {
            success: true,
            statusCode: 200,
            message: `Successfully obtained languages for service: ${serviceId}`,
            responseObject: jsonString
        };
    }
    catch (error) {
        console.log(`Error getting subscribers for service: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `Error obtaining languages for service: ${serviceId}`,
            responseObject: {
                error: error
            }
        };
    }
};
export const getActiveLanguages = (io, serviceId) => {
    var _a, _b, _c, _d;
    //    const jsonData = {
    //        serviceId: serviceId,
    //        languages: []
    //    };
    const activeLanguages = {
        serviceId: serviceId,
        languages: []
    };
    // Get the number of subscribers to the transcript
    const transcriptRoom = `${serviceId}:transcript`;
    const transcriptRoomObj = io.sockets.adapter.rooms.get(transcriptRoom);
    const transcriptSubscribers = (transcriptRoomObj == undefined) ? 0 : transcriptRoomObj.size;
    // Get the languages currently active 
    const langArray = serviceLanguageMap.get(serviceId);
    if (langArray == undefined || langArray.length == 0 && transcriptSubscribers == 0) {
        //        return { result: "There are no languages currently being subscribed to." };
        return (activeLanguages);
    }
    // First put in transcript subscribers
    activeLanguages.languages.push({
        name: "Transcript",
        subscribers: transcriptSubscribers
    });
    // Get the number of subscribers for each of the languages
    for (let language in langArray) {
        const room = `${serviceId}:${langArray[language]}`;
        const clients = (_d = (_c = (_b = (_a = io === null || io === void 0 ? void 0 : io.sockets) === null || _a === void 0 ? void 0 : _a.adapter) === null || _b === void 0 ? void 0 : _b.rooms) === null || _c === void 0 ? void 0 : _c.get(room)) === null || _d === void 0 ? void 0 : _d.size;
        const languageEntry = {
            name: langArray[language],
            subscribers: (clients == undefined) ? 0 : clients
        };
        activeLanguages.languages.push(languageEntry);
    }
    return (activeLanguages);
};
