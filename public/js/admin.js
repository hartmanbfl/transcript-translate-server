async function getMicrophone() {
    const audioInputSelect = document.getElementById("audioInputSelect");
    const selectedDeviceId = audioInputSelect.value;
    const constraints = { audio: { deviceId: selectedDeviceId } };
    const userMedia = await navigator.mediaDevices.getUserMedia(constraints);

    return new MediaRecorder(userMedia);
}

async function openMicrophone(microphone, socket) {
    await microphone.start(500);

    microphone.onstart = () => {
        console.log("client: microphone opened");
        document.body.classList.add("recording");
    };

    microphone.onstop = () => {
        console.log("client: microphone closed");
        document.body.classList.remove("recording");
    };

    microphone.ondataavailable = (e) => {
        socket.emit("audio_available", e.data);
    };
}

async function closeMicrophone(microphone) {
    microphone.stop();
    microphone.stream.getTracks().forEach(track => track.stop());
}

async function startListening(socket) {
    const listenButton = document.getElementById("micStart");
    const stopAudio = document.getElementById("micStop");
    let microphone;

    console.log("client: waiting to open microphone");

    listenButton.addEventListener("click", async () => {
        if (!microphone) {
            // open and close the microphone
            microphone = await getMicrophone();
            await openMicrophone(microphone, socket);
        }
    });
    stopAudio.addEventListener("click", async () => {
        if (microphone) {
            await closeMicrophone(microphone);
            microphone = undefined;
        }
    });
}

const getUserAudioDevices = () => {
    navigator.mediaDevices.enumerateDevices()
        .then((devices) => {
            const audioInputDevices = devices.filter((device) => device.kind === "audioinput");
            const audioInputSelect = document.getElementById("audioInputSelect");
            audioInputDevices.forEach((device) => {
                const option = document.createElement("option");
                option.value = device.deviceId;
                option.text = device.label || `Microphone ${audioInputSelect.length + 1}`;
                console.log(`Found device: ${option.text}`);
                audioInputSelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.error(error);
        });
}

const setupLanguages = (socket) => {
    let currentLanguage;
    document.getElementById("langInputSelect").addEventListener("change", () => {
        const selectedLanguage = document.getElementById("langInputSelect").value;
        
        // If language has changed, unsubscribe from previous
        if (currentLanguage != selectedLanguage) {
            currentLanguage === "" ? console.log(`No unsubscribe required`) : socket.emit("unsubscribe", currentLanguage);
            currentLanguage = selectedLanguage;
        }

        if (selectedLanguage === "") {
            console.log(`No language is selected.`);
        } else {
            console.log(`Selected language: ${selectedLanguage}`);
            socket.emit("subscribe", selectedLanguage);
        }
    });
}

const generateRandomPin = () => {
    return Math.floor(Math.random() * 900000 + 100000);
}


window.addEventListener("load", async () => {
    const deepgramConnect = document.getElementById('deepConnect');
    const deepgramDisconnect = document.getElementById('deepDisconnect');
    const pinGenerate = document.getElementById('pinGenerate');
    const serviceId = document.getElementById('serviceId');
    const startStreaming = document.getElementById('streamStart');
    const stopStreaming = document.getElementById('streamStop');
    const transcript = document.getElementById('transcript');
    const transcriptTextBox = document.getElementById('transcript-text-box');
    const translation = document.getElementById('translation');
    const translationTextBox = document.getElementById('translation-text-box');

//    const socket = io("wss://live-pegasus-first.ngrok-free.app");
    const adminSocket = io('/admin-control');
    const publicSocket = io('/');
    let deepgramState;

    // When we first load, generate a new PIN if one isn't already defined
    let serviceCode;
    if (sessionStorage.getItem('serviceId') === null) {
        serviceCode = generateRandomPin();
        console.log(`No service code yet.  Generating PIN of ${serviceCode}`);
        sessionStorage.setItem('serviceId', serviceCode);
    } else {
        console.log(`Using existing PIN: ${sessionStorage.getItem('serviceId')}`);
        serviceCode = sessionStorage.getItem('serviceId');
    }
    serviceId.innerHTML = serviceCode;

    // Populate the dropdown list of audio input devices
    await getUserAudioDevices();

    // Populate the language select
    setupLanguages(publicSocket);

    // get the initial state of Deepgram
    adminSocket.emit('deepgram_state_request');
    adminSocket.on('deepgram_state', (state) => {
        deepgramState = state;
        console.log(`Current state of Deepgram is: ${state}`);
    });


    // Button listeners
    pinGenerate.addEventListener("click", () => {
        serviceCode = generateRandomPin();
        serviceId.innerHTML = serviceCode;
        // Update session storage
        sessionStorage.setItem('serviceId', serviceCode);
    })
    deepgramConnect.addEventListener("click", () => {
        adminSocket.emit('deepgram_connect');
    });
    deepgramDisconnect.addEventListener("click", () => {
        adminSocket.emit('deepgram_disconnect');
    });
    startStreaming.addEventListener("click", function() {
        adminSocket.emit('streaming_start');
    });
    stopStreaming.addEventListener("click", function() {
        adminSocket.emit('streaming_stop');
    });

    // Listen for transcript messages coming in from Deepgram
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

    // Start streaming from the audio device 
    startListening(adminSocket);

});