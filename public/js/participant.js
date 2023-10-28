const serviceSocket = io('/');
const url = new URL(location.href)
const search = new URLSearchParams(url.search)
const id = search.get('id')

const setupLanguages = () => {
    let currentLanguage = undefined;
    document.getElementById("langInputSelect").addEventListener("change", () => {
        const selectedLanguage = document.getElementById("langInputSelect").value;

        // If language has changed, unsubscribe from previous
        if (currentLanguage != selectedLanguage) {
            if (currentLanguage === undefined) {
                console.log(`No unsubscribe required`);
            } else {
                const room = `${id}:${currentLanguage}`;
                console.log(`Leaving room-> ${room}`);
                serviceSocket.emit("leave", room);
            }
            currentLanguage = selectedLanguage;
        }

        if (selectedLanguage === "") {
            console.log(`No language is selected.`);
        } else {
            console.log(`Selected language: ${selectedLanguage}`);
            const room = `${id}:${selectedLanguage}`
                serviceSocket.emit("join", room);
        }
    });
}

const registerForTranscripts = (serviceId) => {
    const room = `${serviceId}:transcript`;
    serviceSocket.emit("join", room);
}

window.addEventListener("load", async () => {
    const transcript = document.getElementById('transcript');
    const transcriptTextBox = document.getElementById('transcript-text-box');
    const translation = document.getElementById('translation');
    const translationTextBox = document.getElementById('translation-text-box');

    document.querySelector('#id').textContent = id

    // Populate the language select
    setupLanguages();

    // register to receive transcripts
    registerForTranscripts(id);

    // Listen for transcript messages coming in from the Server
    serviceSocket.on('transcript', (msg) => {
        var item = document.createElement('li');
        item.textContent = msg;
        transcript.appendChild(item);
        transcript.scrollTop = transcript.scrollHeight;
        transcriptTextBox.scrollTo(0, transcript.scrollHeight);
    });

    serviceSocket.on('translation', (msg) => {
        var item = document.createElement('li');
        item.textContent = msg;
        translation.appendChild(item);
        translation.scrollTop = translation.scrollHeight;
        translationTextBox.scrollTo(0, translation.scrollHeight);
    })
});