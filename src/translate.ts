import * as dotenv from 'dotenv';
import translate  from 'google-translate-api-x';
import TranslationResponse from 'google-translate-api';
import { TranslationServiceClient } from '@google-cloud/translate';
import { transcriptAvailServiceSub } from './globals.js';
import { Namespace, Server } from 'socket.io';
import { SocketIoService } from './services/socketio.service.js';

dotenv.config();

let TRANSLATE: any;
let parent: any;
if (process.env.USE_GOOGLE_TRANSLATE_SUBSCRIPTION === "true") {
    console.log(`Using a subscription based Google Translate Key`);
    TRANSLATE = new TranslationServiceClient();
    TRANSLATE.getProjectId().then((result: any) => {
        parent = `projects/${result}`;
        console.log(`Setting project to: ${parent}`);
    });
} else {
    console.log(`Using a limited free Google Translate version.`);
}

const translateText = async (data: any) => {
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

const distributeTranslation = (data: any) => {
    const { io, channel, translation, tenantId } = data;
    try {
        if (process.env.DEBUG_TRANSLATION) console.log(`Sending on ${channel}, Cloud translated-> ${translation}`);
        
        let clientConnection: Server | Namespace;
        if (tenantId) {
            clientConnection = io.of(SocketIoService.getClientNamespace(tenantId));            
        } else {
            clientConnection = io;
        }
        clientConnection.to(channel).emit("translation", translation);
    } catch (error) {
        console.log(`Error in distribute translation: ${error}`);
    }
}

async function translateTextAndDistribute(data: any) {
    const { io, channel, lang, transcript, tenantId } = data;
    try {
        const translated  = await translate(transcript, { to: lang });
        // @ts-ignore - using free google translate
        console.log(`Sending ${lang} to ${channel}, transcript-> ${transcript} : translated-> ${translated.text}`);
        let clientConnection: Server | Namespace;
        if (tenantId) {
            clientConnection = io.of(SocketIoService.getClientNamespace(tenantId));
        } else {
            clientConnection = io;
        }
        // @ts-ignore - using free google translate
        clientConnection.to(channel).emit("translation", translated.text);
        // @ts-ignore - using free google translate
        return translated.text;
    } catch (error) {
        console.error(`Caught error in translateTextAndDistribute: ${error}`);
    }
}

// Service based methods

// data = {io, serviceId} 
export const registerForServiceTranscripts = (data: any) => {
    const { io, serviceLanguageMap, tenantId } = data;
    const serviceId: string = data.serviceId;

    // TBD - not multi tenant
    const serviceSubscriptionMap: Map<string, boolean> = data.serviceSubscriptionMap;

    // Check if we have already registered
    if (serviceSubscriptionMap.get(serviceId) !== undefined && serviceSubscriptionMap.get(serviceId) === true) {
        console.log(`Already registered so returning.`);
        return;
    }

    let clientConnection: Server | Namespace;
    if (tenantId) {
        clientConnection = io.of(SocketIoService.getClientNamespace(tenantId));
    } else {
        clientConnection = io;
    }

    // Initialize the service  
    console.log(`Initializing language map for service: ${serviceId}.`);
    serviceLanguageMap.set(serviceId, []);
    serviceSubscriptionMap.set(serviceId, true);

    // Subscribe to a RxJs Subject to detect when transcripts are available
    const subscription = transcriptAvailServiceSub.subscribe(async (data) => {
        const { serviceCode, transcript, serviceLanguageMap } = data;

        if (process.env.DEBUG_TRANSCRIPT) console.log(`Received transcript: ${serviceCode} ${transcript}`);

        // Send the transcript to any subscribers 
        let channel = `${serviceCode}:transcript`;
        clientConnection.to(channel).emit("transcript", transcript);

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
        languagesForChannel.forEach(async (lang: any) => {

            if (process.env.USE_GOOGLE_TRANSLATE_SUBSCRIPTION === "true") {
                let translation = await translateText({ lang, transcript });
                const ioChannel = `${serviceCode}:${lang}`;
                distributeTranslation({ io, channel: ioChannel, translation, tenantId });
            } else {
                const ioChannel = `${serviceCode}:${lang}`;
                const data = { io, channel: ioChannel, lang, transcript, tenantId };
                let translation = await translateTextAndDistribute(data);
            }
        });
    });
}

export const printLanguageMap = (myMap: any) => {
    for (const [key, value] of myMap.entries()) {
        if (typeof value === 'undefined') {
            console.log(`No languages defined yet for service ${key}`);
            return;
        }
        // value should be an array of strings
        value.forEach(((val: any) => {
            console.log(`key: ${key}, lang: ${val}`);
        }))
    }
}

export const printSubscribersPerLanguage = (data: any) => {
    const io = data.io;
    const serviceId: string = data.serviceId;
    const serviceLanguageMap = data.serviceLanguageMap;

    try {
        let languagesForChannel: string[] = serviceLanguageMap.get(serviceId);
        languagesForChannel.forEach(language => {
            const room = `${serviceId}:${language}`;
            const subscribers = io.sockets.adapter.rooms.get(room).size;
            console.log(`Subscribers for ${language}: ${subscribers}`);
        })
    } catch (error) {
        console.log(`Error printing subscribers`)
    }
}

// data = {serviceId, language}
export const addTranslationLanguageToService = (data: any) => {
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
export const removeTranslationLanguageFromService = (data: any) => {
    const { serviceId, language, serviceLanguageMap } = data;
    let index = serviceLanguageMap.get(serviceId).indexOf(language);
    if (index !== -1) {
        serviceLanguageMap.get(serviceId).splice(index, 1);
    }
}