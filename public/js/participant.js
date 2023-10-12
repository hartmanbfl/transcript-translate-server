const publicSocket = io('/');

const setupLanguages = () => {
    let currentLanguage = undefined;
    document.getElementById("langInputSelect").addEventListener("change", () => {
        const selectedLanguage = document.getElementById("langInputSelect").value;

        // If language has changed, unsubscribe from previous
        if (currentLanguage != selectedLanguage) {
            currentLanguage === undefined ? console.log(`No unsubscribe required`) : publicSocket.emit("unsubscribe", currentLanguage);
            currentLanguage = selectedLanguage;
        }

        if (selectedLanguage === "") {
            console.log(`No language is selected.`);
        } else {
            console.log(`Selected language: ${selectedLanguage}`);
            publicSocket.emit("subscribe", selectedLanguage);
        }
    });
}

window.addEventListener("load", async () => {
    const transcript = document.getElementById('transcript');
    const transcriptTextBox = document.getElementById('transcript-text-box');
    const translation = document.getElementById('translation');
    const translationTextBox = document.getElementById('translation-text-box');

    // Populate the language select
    setupLanguages();

    // Listen for transcript messages coming in from the Server
    publicSocket.on('transcript', (msg) => {
        var item = document.createElement('li');
        item.textContent = msg;
        transcript.appendChild(item);
        transcript.scrollTop = transcript.scrollHeight;
        transcriptTextBox.scrollTo(0, transcript.scrollHeight);
    });

    publicSocket.on('translation', (msg) => {
        var item = document.createElement('li');
        item.textContent = msg;
        translation.appendChild(item);
        translation.scrollTop = translation.scrollHeight;
        translationTextBox.scrollTo(0, translation.scrollHeight);
    })
});