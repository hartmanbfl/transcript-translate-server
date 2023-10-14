const publicSocket = io('/');
let serviceCode;

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

let mediaRecorder;
const getMicrophone = async () => {
    const audioInputSelect = document.getElementById("audioInputSelect");
    const selectedDeviceId = audioInputSelect.value;
    const constraints = { audio: { deviceId: selectedDeviceId } };
    const userMedia = await navigator.mediaDevices.getUserMedia(constraints);
    return mediaRecorder = new MediaRecorder(userMedia);
}
const closeMicrophone = async () => {
    if (!mediaRecorder) {
        console.log(`Trying to close microphone, but it is currently undefined`);
    }
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
}

const setupDeepgram = () => {
    const audioForm = document.getElementById('audioForm');
    audioForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        await getMicrophone();

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

        ws = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', resp.deepgramToken])
        ws.onopen = startStreamingToDeepgram;
        ws.onmessage = handleDeepgramResponse;
        ws.onclose = () => {
            console.log(`WebSocket to Deepgram closed`);
        }

        const stopStreaming = document.querySelector(`#disableStreaming`);
        stopStreaming.style.display = "block";
        stopStreaming.addEventListener('click', async () => {
            await closeMicrophone();
            ws.close();
            stopStreaming.style.display = "none";
            document.getElementById('recording-light').style.display = "none";
            audioForm.style.display = "block";
        })
    });
}

const startStreamingToDeepgram = () => {
    console.log(`WebSocket to Deepgram opened`);
    document.getElementById('recording-light').style.display = "block";
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
    const transcriptText = document.getElementById('transcript');
    const transcriptTextBox = document.getElementById('transcript-text-box');
    if (transcript && data.is_final) {
        var item = document.createElement('li');
        item.textContent = transcript;
        transcriptText.appendChild(item);
        transcriptText.scrollTop = transcriptText.scrollHeight;
        transcriptTextBox.scrollTo(0, transcriptText.scrollHeight);

        console.log(`Transcript ready for service: ${serviceCode}`);

        // Send to our server
        const data = {serviceCode, transcript};
        publicSocket.emit('transcriptReady', data)
    }
}

let useInterim = false;
window.addEventListener("load", async () => {
    const serviceId = document.getElementById('serviceId');
    const interimCheckbox = document.getElementById('interimCheckbox')

    if (interimCheckbox.checked) {
        useInterim = true;
    } else {
        useInterim = false;
    }

    interimCheckbox.addEventListener("change", () => {
        if (interimCheckbox.checked) {
            console.log(`Using interim results`);
            useInterim = true;
        } else {
            console.log(`Not using interim results`);
            useInterim = false;
        }
    })

    // When we first load, generate a new PIN if one isn't already defined
    if (sessionStorage.getItem('serviceId') === null) {
        serviceCode = generateRandomPin();
        sessionStorage.setItem('serviceId', serviceCode);
    } else {
        serviceCode = sessionStorage.getItem('serviceId');
    }
    serviceId.innerHTML = serviceCode;

    // Populate the dropdown list of audio input devices
    await getUserAudioDevices();

    setupDeepgram();

});