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
                audioInputSelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.error(error);
        });
}


window.addEventListener("load", () => {
    const socket = io("wss://live-pegasus-first.ngrok-free.app");
    let deepgramState;

    const deepgramConnect = document.getElementById('deepConnect');
    const deepgramDisconnect = document.getElementById('deepDisconnect');
    const startStreaming = document.getElementById('streamStart');
    const stopStreaming = document.getElementById('streamStop');
    const messages = document.getElementById('messages');
    const transcriptTextBox = document.getElementById('transcript-text-box');

    // get the initial state of Deepgram
    socket.emit('deepgram_state_request');
    socket.on('deepgram_state', (state) => {
        deepgramState = state;
        console.log(`Current state of Deepgram is: ${state}`);
//        if (state === 1) {  // OPEN
//            deepgramConnect.textContent = "Deepgram Disconnect";
//            deepgramConnect.className = "stop-action"            
//        } else {
//            deepgramConnect.textContent = "Deepgram Connect";
//            deepgramConnect.className = "start-action"            
//        }
    })


//    deepgramConnect.addEventListener("click", () => {
//        if (deepgramState === 1 ) { // currently ON
//            socket.emit('deepgram_disconnect');
//            deepgramConnect.textContent = "Deepgram Connect";
//            deepgramConnect.className = "start-action"            
//        } else {
//            socket.emit('deepgram_connect');
//            deepgramConnect.textContent = "Deepgram Disconnect";
//            deepgramConnect.className = "stop-action"            
//        }
//        deepgramConnect.classList.toggle("toggled");
//        const isToggled = deepgramConnect.classList.contains("toggled");
//        if (isToggled) {
//            socket.emit('deepgram_connect');
//            deepgramConnect.textContent = "Deepgram Stop";
//        } else {
//            socket.emit('deepgram_disconnect');
//            deepgramConnect.textContent = "Deepgram Start";
//        }
//    });
    deepgramConnect.addEventListener("click", () => {
        socket.emit('deepgram_connect');
    });
    deepgramDisconnect.addEventListener("click", () => {
        socket.emit('deepgram_disconnect');
    });
    startStreaming.addEventListener("click", function() {
        socket.emit('streaming_start');
    });
    stopStreaming.addEventListener("click", function() {
        socket.emit('streaming_stop');
    });

    // Listen for messages coming in from Deepgram
    socket.on('transcript', function (msg) {
        var item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        messages.scrollTop = messages.scrollHeight;
//        window.scrollTo(0, transcriptTextBox.scrollHeight);
        transcriptTextBox.scrollTo(0, messages.scrollHeight);
    });

    // Populate the dropdown list of audio input devices
    getUserAudioDevices();

    // Start streaming from the audio device 
    startListening(socket);

});