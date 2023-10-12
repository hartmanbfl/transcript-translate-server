export class Translation {

    languages = [];
    transcriptAvailableSub = new Rx.Subject();

    constructor(io) {
        this.io = io
    }

    registerForTranscripts() {
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

    addTranslationLanguage(lang) {
        if (languages.indexOf(lang) === -1) {
            languages.push(lang);
        }
    }

    async translateText(lang, text) {
        try {
            const translated = await translate(text, { to: lang });
            return translated.text;
        } catch (error) {
            console.error(`Caught error in translation: ${error}`);
        }
    }
}