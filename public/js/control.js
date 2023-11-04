// Use the control namespace to communicate to the server via WSS.
const controlSocket = io('/control')
let serviceCode;

// Method to see what audio input devices are available on the PC and populate
// a drop-down list with these values
const getUserAudioDevices = async () => {
    const micPermission = await navigator.permissions.query({name: "microphone"});
    if (micPermission.state !== 'granted') {
        await navigator.mediaDevices.getUserMedia({ audio: true });
    }
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

        const deepgramUrl = buildDeepgramUrl();
        ws = new WebSocket(deepgramUrl, ['token', resp.deepgramToken])
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

const getQRCode = async (data) => {
    const serviceId  = data.serviceId;

    // Validate the key with server/Deepgram
    const resp = await fetch('/qrcode', {
        method: 'POST',
        body: JSON.stringify({ serviceId }),
        headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json()).catch(error => alert(error))

    if (resp.error) return alert(resp.error);

    return resp.qrCode;
}

const buildDeepgramUrl = () => {
    const deepgramUrl = `wss://api.deepgram.com/v1/listen`;
    const locale = `language=${selectedLocale}`;
    const smartFormat = `smart_format=true`;
    const aiModel = `model=nova`;

    return `${deepgramUrl}?${locale}&${smartFormat}&aiModel`; 
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

let propresenterHost="localhost";
let propresenterPort="1025";
let previousTranscript = "";
const handleDeepgramResponse = async (message) => {
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

        // If requested, push latest transcript to ProPresenter
        if (pushToProPresenter) {
            propresenterHost = document.querySelector('#host').value;
            propresenterPort = document.querySelector('#port').value;
            const resp = await fetch(`http://${propresenterHost}:${propresenterPort}/v1/message/Translation/trigger`, {
                method: 'POST',
                body: JSON.stringify( [
                    {
                    name: "Message",
                        text: {
                            text: previousTranscript + "\n" + transcript
                        }
                    }
                ]),
                headers: { 'Content-Type': 'application/json' }
            }).then(r => r.json()).catch(error => console.log(error))
            previousTranscript = transcript;
        }


        // Send to our server
        const data = {serviceCode, transcript};
        controlSocket.emit('transcriptReady', data)
    }
}

let selectedLocale = "en-GB";
const setupSourceLanguage = () => {
    const localeDropDown = document.getElementById('langInputSelect');
    const locales = [
        { value: 'en-GB', text: 'English UK' },
        { value: 'en-US', text: 'English US' },
        { value: 'fr', text: 'French' },
        { value: 'de', text: 'German' },
        { value: 'es', text: 'Spanish' }
    ];

    locales.forEach(locale => {
        const option = document.createElement("option");
        option.value = locale.value;
        option.text = locale.text;
        localeDropDown.add(option);
    });

    localeDropDown.addEventListener("change", () => {
        selectedLocale = localeDropDown.value;
    });
}

let useInterim = false;
let pushToProPresenter = false;

window.addEventListener("load", async () => {
    const serviceId = document.getElementById('serviceId');
    const interimCheckbox = document.getElementById('interimCheckbox')

    // Populate the dropdown list of audio input devices
    await getUserAudioDevices();

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

    const propresenterCheckbox = document.getElementById('propresenterCheckbox')

    if (propresenterCheckbox.checked) {
        pushToProPresenter = true;
    } else {
        pushToProPresenter = false;
    }

    propresenterCheckbox.addEventListener("change", () => {
        if (propresenterCheckbox.checked) {
            console.log(`Push to ProPresenter`);
            pushToProPresenter = true;
        } else {
            console.log(`Not pushing to ProPresenter`);
            pushToProPresenter = false;
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

    // Get a QR Code for this service
    const qrcode = await getQRCode({serviceId: serviceCode});

    const qrcodeBox = document.getElementById('qrcode-box');
    const parser = new DOMParser();
    const svgElement = parser.parseFromString(qrcode, 'image/svg+xml').documentElement;
    qrcodeBox.appendChild(svgElement);


    // Populate the dropdown lists of input languages
    setupSourceLanguage();

    setupDeepgram();

});