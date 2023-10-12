const adminSocket = io('/admin-control');
const publicSocket = io('/');

let mediaRecorder;
let clientSideConnectionToDeepgram = false;

const getMicrophone = async () => {
    const audioInputSelect = document.getElementById("audioInputSelect");
    const selectedDeviceId = audioInputSelect.value;
    const constraints = { audio: { deviceId: selectedDeviceId } };
    const userMedia = await navigator.mediaDevices.getUserMedia(constraints);
    return mediaRecorder = new MediaRecorder(userMedia);

    //    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    //        if (!MediaRecorder.isTypeSupported('audio/webm')) return alert('Browser not supported')
    //        return mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    //    }).catch(() => alert('You must provide access to the microphone'))

}

// Use this function if sending the audio stream to Deepgram
const sendAudioStream = async (microphone) => {
    const audioForm = document.getElementById('audioForm');
    audioForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const churchKey = document.querySelector('#key').value;
        const serviceId = sessionStorage.getItem('serviceId');

        // Validate the key with server/Deepgram
        const resp = await fetch('/auth', {
            method: 'POST',
            body: JSON.stringify({ serviceId, churchKey }),
            headers: { 'Content-Type': 'application/json' }
        }).then(r => r.json()).catch(error => alert(error))

        if (resp.error) return alert(resp.error);

        document.querySelector('#audioForm').style.display = "none";
        document.querySelector(`#enableStreaming`).style.display = "none";

        ws = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', resp.deepgramToken])
        ws.onopen = startStreamingToDeepgram;
        ws.onmessage = handleDeepgramResponse;
        ws.onclose = () => {
            console.log(`WebSocket to Deepgram closed`);
        }

        const stopStreaming = document.querySelector(`#disableStreaming`);
        stopStreaming.style.display = "block";
        stopStreaming.addEventListener('click', async () => {
            await closeMicrophone(microphone);
            ws.close();
        })

    });
}

const startStreamingToDeepgram = () => {
    console.log(`WebSocket to Deepgram opened`);
    mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0 && ws.readyState == 1) {
            ws.send(event.data)
        }
    })
    mediaRecorder.start(250)
}

const handleDeepgramResponse = (message) => {
    const data = JSON.parse(message.data)
    const transcript = data.channel.alternatives[0].transcript
    if (transcript && data.is_final) {
        const transcriptText = document.getElementById('transcript');
        const transcriptTextBox = document.getElementById('transcript-text-box');
        var item = document.createElement('li');
        item.textContent = transcript;
        transcriptText.appendChild(item);
        transcriptText.scrollTop = transcriptText.scrollHeight;
        transcriptTextBox.scrollTo(0, transcriptText.scrollHeight);

        // Send to our server
        publicSocket.emit('transcriptReady', transcript)
    }
}

// Use this function if sending the audio stream to the server
const openMicrophone = async (microphone, socket) => {
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

const closeMicrophone = async (microphone) => {
    if (!microphone) {
        console.log(`Trying to close microphone, but it is currently undefined`);
    }
    microphone.stop();
    microphone.stream.getTracks().forEach(track => track.stop());
}

const startListening = async (socket) => {
    const listenButton = document.getElementById("micStart");
    const stopAudio = document.getElementById("micStop");
    const audioStreamButton = document.getElementById("enableStreaming");
    let microphone;

    audioStreamButton.addEventListener("click", async () => {
        clientSideConnectionToDeepgram = true;
        const audioForm = document.getElementById('audioForm');
        audioForm.style.display = "block";
        if (!microphone) {
            microphone = await getMicrophone();
            await sendAudioStream(microphone);
        }
    });

    listenButton.addEventListener("click", async () => {
        if (!microphone) {
            // open and close the microphone
            microphone = await getMicrophone();
            await openMicrophone(microphone, socket);
        }
    });
    stopAudio.addEventListener("click", async () => {
        if (microphone) {
            console.log(`Stopping audio`);
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
                //DEBUG                console.log(`Found device: ${option.text}`);
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

//const generateRandomPin = () => {
//    return Math.floor(Math.random() * 900000 + 100000);
//}
//
//const printDeepgramState = (state) => {
//    switch (state) {
//        case 0:
//            return "CONNECTING";
//        case 1:
//            return "OPEN";
//        case 2:
//            return "CLOSING";
//        case 3:
//            return "CLOSED";
//        default:
//            return "UNKNOWN";
//    }
//}

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
    let deepgramState;

    // When we first load, generate a new PIN if one isn't already defined
    let serviceCode;
    if (sessionStorage.getItem('serviceId') === null) {
        serviceCode = generateRandomPin();
        sessionStorage.setItem('serviceId', serviceCode);
    } else {
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
        console.log(`Current state of Deepgram is: ${printDeepgramState(state)}`);
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
    startStreaming.addEventListener("click", function () {
        adminSocket.emit('streaming_start');
    });
    stopStreaming.addEventListener("click", function () {
        adminSocket.emit('streaming_stop');
    });

    // Listen for transcript messages coming in from the Server
    publicSocket.on('transcript', (msg) => {
        if (!clientSideConnectionToDeepgram) {
            var item = document.createElement('li');
            item.textContent = msg;
            transcript.appendChild(item);
            transcript.scrollTop = transcript.scrollHeight;
            transcriptTextBox.scrollTo(0, transcript.scrollHeight);
        }
    });

    publicSocket.on('translation', (msg) => {
        // Only post these if our connection to deepgram is from 
        // the server side
        var item = document.createElement('li');
        item.textContent = msg;
        translation.appendChild(item);
        translation.scrollTop = translation.scrollHeight;
        translationTextBox.scrollTo(0, translation.scrollHeight);
    })

    // Start streaming from the audio device 
    startListening(adminSocket);

});