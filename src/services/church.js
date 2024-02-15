import { getChurchAdditionalWelcome, getChurchDefaultServiceId, getChurchGreeting, getChurchLanguage, getChurchLogoBase64, getChurchMessage, getChurchName, getChurchSecretKey, getChurchServiceTimeout, getChurchTranslationLanguages, getChurchWaitingMessage } from '../repositories/church.js';
import { serviceSubscriptionMap } from '../repositories/index.js';

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
        }
    } catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error getting church info`,
            responseObject: null
        }
    }
}
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
        }
    } catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error: ${error}`,
            responseObject: {
                error: error
            }
        }
    }
}
export const statusService = ({serviceId}) => {
    try {
        // See if this service ID exists in the service map
        const active = serviceSubscriptionMap.get(serviceId);
        if (process.env.EXTRA_DEBUGGING) console.log(`Checking if ${serviceId} exists in the serviceSubscriptionMap: ${active}`);
        return {
            success: true,
            statusCode: 200,
            message: `Service is currently ${active}`,
            responseObject: {
                active: active
            }
        }
    } catch (error) {
        return {
            success: false,
            statusCode: 400,
            message: `Error: ${error}`,
            responseObject: {
                error: error
            }
        }
    }
}