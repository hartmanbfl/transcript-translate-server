import { getChurchAdditionalWelcome, getChurchDefaultServiceId, getChurchGreeting, getChurchLanguage, getChurchLogoBase64, getChurchMessage, getChurchName, getChurchServiceTimeout, getChurchTranslationLanguages, getChurchWaitingMessage } from '../repositories/church.js';
import { serviceLanguageMap, serviceSubscriptionMap, streamingStatusMap } from '../repositories/index.js';
import { getClientIo } from './socketio.js';
export var infoService = function () {
    try {
        var churchName = getChurchName();
        var churchLogoBase64 = getChurchLogoBase64();
        var churchGreeting = getChurchGreeting();
        var churchMessage = getChurchMessage();
        var churchWaitingMessage = getChurchWaitingMessage();
        var churchAdditionalWelcome = getChurchAdditionalWelcome();
        var churchLang = getChurchLanguage();
        var defaultServiceId = getChurchDefaultServiceId();
        var translationLanguages = getChurchTranslationLanguages();
        return {
            success: true,
            statusCode: 200,
            message: "Info generated successfully",
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
            message: "Error getting church info",
            responseObject: null
        };
    }
};
export var configurationService = function () {
    try {
        return {
            success: true,
            statusCode: 200,
            message: "Configuration generated successfully",
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
            message: "Error: ".concat(error),
            responseObject: {
                error: error
            }
        };
    }
};
export var statusService = function (serviceId) {
    try {
        // See if this service ID exists in the service map
        var active = serviceSubscriptionMap.get(serviceId);
        if (process.env.EXTRA_DEBUGGING)
            console.log("Checking if ".concat(serviceId, " exists in the serviceSubscriptionMap: ").concat(active));
        return {
            success: true,
            statusCode: 200,
            message: "Service is currently ".concat(active),
            responseObject: {
                active: active
            }
        };
    }
    catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: "Error: ".concat(error),
            responseObject: {
                error: error
            }
        };
    }
};
export var getLivestreamStatus = function (serviceId) {
    try {
        var streamingStatus = streamingStatusMap.get(serviceId);
        return {
            success: true,
            statusCode: 200,
            message: "Streaming Status for service ".concat(serviceId),
            responseObject: {
                status: streamingStatus
            }
        };
    }
    catch (error) {
        console.error("ERROR getting streaming status: ".concat(error));
        return {
            success: false,
            statusCode: 400,
            message: "Failed to get Streaming Status for service ".concat(serviceId),
            responseObject: {
                error: error
            }
        };
    }
};
export var getLanguages = function (serviceId) {
    try {
        var clientIo = getClientIo();
        var jsonString = getActiveLanguages(clientIo, serviceId);
        return {
            success: true,
            statusCode: 200,
            message: "Successfully obtained languages for service: ".concat(serviceId),
            responseObject: jsonString
        };
    }
    catch (error) {
        console.log("Error getting subscribers for service: ".concat(error));
        return {
            success: false,
            statusCode: 400,
            message: "Error obtaining languages for service: ".concat(serviceId),
            responseObject: {
                error: error
            }
        };
    }
};
export var getActiveLanguages = function (io, serviceId) {
    var _a, _b, _c, _d;
    //    const jsonData = {
    //        serviceId: serviceId,
    //        languages: []
    //    };
    var activeLanguages = {
        serviceId: serviceId,
        languages: []
    };
    // Get the number of subscribers to the transcript
    var transcriptRoom = "".concat(serviceId, ":transcript");
    var transcriptRoomObj = io.sockets.adapter.rooms.get(transcriptRoom);
    var transcriptSubscribers = (transcriptRoomObj == undefined) ? 0 : transcriptRoomObj.size;
    // Get the languages currently active 
    var langArray = serviceLanguageMap.get(serviceId);
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
    for (var language in langArray) {
        var room = "".concat(serviceId, ":").concat(langArray[language]);
        var clients = (_d = (_c = (_b = (_a = io === null || io === void 0 ? void 0 : io.sockets) === null || _a === void 0 ? void 0 : _a.adapter) === null || _b === void 0 ? void 0 : _b.rooms) === null || _c === void 0 ? void 0 : _c.get(room)) === null || _d === void 0 ? void 0 : _d.size;
        var languageEntry = {
            name: langArray[language],
            subscribers: (clients == undefined) ? 0 : clients
        };
        activeLanguages.languages.push(languageEntry);
    }
    return (activeLanguages);
};
