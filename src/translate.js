import translate from 'google-translate-api-x';
import { transcriptAvailServiceSub, transcriptSubject } from './globals.js';

// Array of languages that are supported and if there are any subscribers
let languages = [];

// Map of Services/Languages - Church Services are the keys, and array of 
// languages the values
let serviceLanguageMap = new Map();

// TBD - make the payload of the Subject a json object that includes the service id

export const registerForTranscripts = (io) => {
    const transcriptSubscription = transcriptSubject.subscribe((transcript) => {
        console.log(`Received new transcript Subject: ${transcript}`);
        // Translate into our current language list
        languages.forEach(async (lang) => {
            let translation = await translateText(lang, transcript);
            console.log(`Translation in ${lang}: ${translation}`);

            // Send this language to all participants that are
            // subscribed to it
            io.to(lang).emit("translation", translation);
        })
    });
}

export const addTranslationLanguage = (lang) => {
    if (languages.indexOf(lang) === -1) {
        languages.push(lang);
    }
}

async function translateText(lang, text) {
    try {
        const translated = await translate(text, { to: lang });
        return translated.text;
    } catch (error) {
        console.error(`Caught error in translation: ${error}`);
    }
}

// Service based methods

export const registerForServiceTranscripts = (io) => {
    const subscription = transcriptAvailServiceSub.subscribe((data) => {
        const serviceId = data.serviceId;
        const transcript = data.transcript;

        // TBD
        // Check if the service already exists
    })
}

// data = {serviceId, language}
export const addTranslationLanguageToService = (data) => {
    const service = data.serviceId;
    const lang = data.language;
    serviceLanguageMap.get(service).push(lang);
}

// data = {serviceId, language}
export const removeTranslationLanguageFromService = (data) => {
    const service = data.serviceId;
    const lang = data.language;
    let index = serviceLanguageMap.get(service).indexOf(lang);
    if (index !== -1) {
        serviceLanguageMap.get(service).splice(index, 1);
    }
}