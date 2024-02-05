import * as dotenv from 'dotenv';
import translate from 'google-translate-api-x';
import { TranslationServiceClient } from '@google-cloud/translate';
import { transcriptAvailServiceSub } from './globals.js';

dotenv.config();

let TRANSLATE;
let parent;
if (process.env.USE_GOOGLE_TRANSLATE_SUBSCRIPTION === "true") {
    console.log(`Using a subscription based Google Translate Key`);
    TRANSLATE = new TranslationServiceClient();
    TRANSLATE.getProjectId().then(result => {
        parent = `projects/${result}`;
        console.log(`Setting project to: ${parent}`);
    });
} else {
    console.log(`Using a limited free Google Translate version.`);
}

const translateText = async (data) => {
    const { lang, transcript } = data;
    const request = {
        contents: [transcript],
        parent: parent,
        mimeType: 'text/plain',
        targetLanguageCode: lang
    };
    try {
        const [response] = await TRANSLATE.translateText(request);
        let translatedText = '';
        for (const translation of response.translations) {
            translatedText = translatedText + ' ' + translation.translatedText;
        }
        return translatedText;
    } catch (error) {
        console.log(`Error in translateText: ${error}`);
    }
}

const distributeTranslation = (data) => {
    const { io, channel, translation } = data;
    try {
        if (process.env.DEBUG_TRANSLATION) console.log(`Sending on ${channel}, Cloud translated-> ${translation}`);
        io.to(channel).emit("translation", translation);
    } catch (error) {
        console.log(`Error in distribute translation: ${error}`);
    }
}

async function translateTextAndDistribute(data) {
    const { io, channel, lang, transcript } = data;
    try {
        const translated = await translate(transcript, { to: lang });
        console.log(`Sending ${lang} to ${channel}, transcript-> ${transcript} : translated-> ${translated.text}`);
        io.to(channel).emit("translation", translated.text);
        return translated.text;
    } catch (error) {
        console.error(`Caught error in translateTextAndDistribute: ${error}`);
    }
}

// Service based methods

// data = {io, serviceId} 
export const registerForServiceTranscripts = (data) => {
    const { io, serviceId, serviceLanguageMap, serviceSubscriptionMap } = data;

    // Check if we have already registered
    if (serviceSubscriptionMap.get(serviceId) !== undefined && serviceSubscriptionMap.get(serviceId) === true) {
        console.log(`Already registered so returning.`);
        return;
    }

    // Initialize the service  
    console.log(`Initializing language map for service: ${serviceId}`);
    serviceLanguageMap.set(serviceId, []);
    serviceSubscriptionMap.set(serviceId, true);

    // Subscribe to a RxJs Subject to detect when transcripts are available
    const subscription = transcriptAvailServiceSub.subscribe(async (data) => {
        const { serviceCode, transcript, serviceLanguageMap } = data;

        if (process.env.DEBUG_TRANSCRIPT) console.log(`Received transcript: ${serviceCode} ${transcript}`);

        // Send the transcript to any subscribers 
        let channel = `${serviceCode}:transcript`;
        io.to(channel).emit("transcript", transcript);

        // Now send the translation to any subscribers.  First get the array
        // of currently subscribed languages for this service
        let languagesForChannel = serviceLanguageMap.get(serviceCode);

        if (typeof languagesForChannel === 'undefined') {
            return;
        }

        // Now iterate over the languages, getting and emitting the translation
        if (process.env.EXTRA_DEBUGGING) {
            console.log(`Current languagesForChannel: `)
            printLanguageMap(serviceLanguageMap);
        }
        languagesForChannel.forEach(async lang => {

            if (process.env.USE_GOOGLE_TRANSLATE_SUBSCRIPTION === "true") {
                let translation = await translateText({ lang, transcript });
                const ioChannel = `${serviceCode}:${lang}`;
                distributeTranslation({ io, channel: ioChannel, translation });
            } else {
                const ioChannel = `${serviceCode}:${lang}`;
                const data = { io, channel: ioChannel, lang, transcript };
                let translation = await translateTextAndDistribute(data);
            }
        });
    });
}

export const printLanguageMap = (myMap) => {
    for (const [key, value] of myMap.entries()) {
        if (typeof value === 'undefined') {
            console.log(`No languages defined yet for service ${key}`);
            return;
        }
        // value should be an array of strings
        value.forEach((val => {
            console.log(`key: ${key}, lang: ${val}`);
        }))
    }
}

export const printSubscribersPerLanguage = (data) => {
    const io = data.io;
    const sericeId = data.sericeId;
    const serviceLanguageMap = data.serviceLanguageMap;

    try {
        let languagesForChannel = serviceLanguageMap.get(serviceId);
        languagesForChannel.forEach(language => {
            const room = `${sericeId}:${language}`;
            const subscribers = io.sockets.adapter.rooms.get(room).size;
            console.log(`Subscribers for ${language}: ${subscribers}`);
        })
    } catch (error) {
        console.log(`Error printing subscribers`)
    }
}

// data = {serviceId, language}
export const addTranslationLanguageToService = (data) => {
    const { serviceId, language, serviceLanguageMap } = data;

    if (serviceLanguageMap.get(serviceId) === undefined) {
        let langArray = [language];
        serviceLanguageMap.set(serviceId, langArray);
    } else {
        // only add language if it doesn't already exist
        let langArray = serviceLanguageMap.get(serviceId);
        if (langArray.indexOf(language) == -1) {
            langArray.push(language);
            serviceLanguageMap.set(serviceId, langArray);
        }
    }
}

// data = {serviceId, language}
export const removeTranslationLanguageFromService = (data) => {
    const { serviceId, language, serviceLanguageMap } = data;
    let index = serviceLanguageMap.get(serviceId).indexOf(language);
    if (index !== -1) {
        serviceLanguageMap.get(serviceId).splice(index, 1);
    }
}