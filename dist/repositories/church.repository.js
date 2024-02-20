import * as dotenv from 'dotenv';
dotenv.config();
export const getChurchSecretKey = () => {
    return process.env.CHURCH_KEY;
};
export const getChurchName = () => {
    return process.env.CHURCH_NAME;
};
export const getChurchLogoBase64 = () => {
    return process.env.CHURCH_LOGO_BASE64;
};
export const getChurchGreeting = () => {
    return process.env.CHURCH_GREETING;
};
export const getChurchMessage = () => {
    return process.env.CHURCH_MESSAGE;
};
export const getChurchWaitingMessage = () => {
    return process.env.CHURCH_WAITING_MESSAGE;
};
export const getChurchAdditionalWelcome = () => {
    return process.env.CHURCH_ADDITIONAL_WELCOME;
};
export const getChurchLanguage = () => {
    return process.env.HOST_LANGUAGE;
};
export const getChurchDefaultServiceId = () => {
    return process.env.DEFAULT_SERVICE_ID;
};
export const getChurchTranslationLanguages = () => {
    return process.env.TRANSLATION_LANGUAGES;
};
export const getChurchServiceTimeout = () => {
    return process.env.SERVICE_TIMEOUT;
};
export const getChurchInfo = () => {
    return {
        name: getChurchName(),
        defaultServiceId: getChurchDefaultServiceId(),
        greeting: getChurchGreeting(),
        message: getChurchMessage(),
        additionalWelcome: getChurchAdditionalWelcome(),
        waiting: getChurchWaitingMessage(),
        language: getChurchLanguage(),
        translationLanguages: getChurchTranslationLanguages(),
        base64Logo: getChurchLogoBase64()
    };
};
