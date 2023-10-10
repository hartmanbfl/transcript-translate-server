import translate from 'google-translate-api-x';
import { transcriptSubject } from './globals.js';

// Array of languages that are supported and if there are any subscribers
let languages = [];


export const registerForTranscripts = (io) => {
    const transcriptSubscription = transcriptSubject.subscribe((transcript) => {
        console.log(`Received new transcript Subject: ${transcript}`);
        // Translate into our current language list
        languages.forEach(async (lang) => {
            let translation = await translateText(lang, transcript);
            console.log(`Translation in ${lang}: ${translation}`);
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
    const translated = await translate(text, { to: lang });
    return translated.text;
}
