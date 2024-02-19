import * as dotenv from 'dotenv';
dotenv.config();
export var getChurchSecretKey = function () {
    return process.env.CHURCH_KEY;
};
export var getChurchName = function () {
    return process.env.CHURCH_NAME;
};
export var getChurchLogoBase64 = function () {
    return process.env.CHURCH_LOGO_BASE64;
};
export var getChurchGreeting = function () {
    return process.env.CHURCH_GREETING;
};
export var getChurchMessage = function () {
    return process.env.CHURCH_MESSAGE;
};
export var getChurchWaitingMessage = function () {
    return process.env.CHURCH_WAITING_MESSAGE;
};
export var getChurchAdditionalWelcome = function () {
    return process.env.CHURCH_ADDITIONAL_WELCOME;
};
export var getChurchLanguage = function () {
    return process.env.HOST_LANGUAGE;
};
export var getChurchDefaultServiceId = function () {
    return process.env.DEFAULT_SERVICE_ID;
};
export var getChurchTranslationLanguages = function () {
    return process.env.TRANSLATION_LANGUAGES;
};
export var getChurchServiceTimeout = function () {
    return process.env.SERVICE_TIMEOUT;
};
export var getChurchInfo = function () {
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
