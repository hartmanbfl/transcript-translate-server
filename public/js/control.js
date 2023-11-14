// Use the control namespace to communicate to the server via WSS.
const controlSocket = io('/control')

let selectedLocale = "en-GB";
let serviceCode;
let streamingStatus = "offline";
let serviceTimer;
let serviceTimerDuration = 90 * 60 * 1000; // default to 90 minutes

const languages = [
    {
        key: "ar",
        value: "Arabic"
    },
    {
        key: "de",
        value: "German",
    },
    {
        key: "es",
        value: "Spanish",
    },
    {
        key: "fa",
        value: "Farsi",
    },
    {
        key: "fr",
        value: "French",
    },
    {
        key: "hi",
        value: "Hindi",
    },
    {
        key: "ru",
        value: "Russian",
    },
    {
        key: "tr",
        value: "Turkish",
    },
    {
        key: "uk",
        value: "Ukranian",
    },
    {
        key: "zh",
        value: "Chinese",
    },
];
const languageMap = new Map(languages.map((obj) => [obj.key, obj.value]));


// Method to see what audio input devices are available on the PC and populate
// a drop-down list with these values
const getUserAudioDevices = async () => {
    const micPermission = await navigator.permissions.query({ name: "microphone" });
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
            streamingStatus = "offline";
        }

        const stopStreaming = document.querySelector(`#disableStreaming`);
        stopStreaming.style.display = "block";
        stopStreaming.addEventListener('click', async () => {
            stopServiceTimer();
            await closeMicrophone();
            ws.close();
            stopStreaming.style.display = "none";
            document.getElementById('recording-status').style.display = "none";
            audioForm.style.display = "block";
        })
    });
}

const getQRCode = async (data) => {
    const serviceId = data.serviceId;

    // Validate the key with server/Deepgram
    const resp = await fetch('/qrcode', {
        method: 'POST',
        body: JSON.stringify({ serviceId }),
        headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json()).catch(error => alert(error))

    if (resp.error) return alert(resp.error);

    return resp.qrCode;
}

const processConfigurationProperties = async () => {
    const resp = await fetch('/configuration', {
        method: 'GET'
    }).then(r => r.json())
    .catch(error => alert(error));

    if (resp.error) {
        console.log(`Error fetching configuration: ${resp.error}`);
        return alert(resp.error);
    }

    console.log(`Response: ${JSON.stringify(resp)}`);
    const serviceTimeout = resp.serviceTimeout;
    selectedLocale = resp.hostLanguage;
    serviceTimerDuration = parseInt(serviceTimeout) * 60 * 1000;
    console.log(`Setting service timeout to ${serviceTimerDuration} milliseconds and language to ${selectedLocale}.`);
}

const getLanguageString = (locale) => {
    const language = languageMap.get(locale);
    return (language == undefined) ? locale : language;
}

const buildDeepgramUrl = () => {
    const deepgramUrl = `wss://api.deepgram.com/v1/listen`;
    const locale = `language=${selectedLocale}`;
    const smartFormat = `smart_format=true`;
    const aiModel = `model=nova`;

    return `${deepgramUrl}?${locale}&${smartFormat}&${aiModel}`;
}

const startStreamingToDeepgram = () => {
    console.log(`WebSocket to Deepgram opened`);
    streamingStatus = "livestreaming";

    document.getElementById('recording-status').style.display = "inline-flex";
    mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0 && ws.readyState == 1) {
            ws.send(event.data)
        }
    })
    mediaRecorder.start(250)

    // Start timer to protect from streaming going too long
    startServiceTimer();
}

let heartbeatTimer;
const startHeartbeatTimer = () => {
    heartbeatTimer = setInterval(() => {
        controlSocket.emit('heartbeat', { serviceCode: serviceCode, status: streamingStatus });
    }, 3000);
}
const stopHeartbeatTimer = () => {
    clearInterval(heartbeatTimer);
}

const startServiceTimer = () => {
    clearTimeout(serviceTimer);
    console.log(`Starting service timer with duration ${serviceTimerDuration}`)
    serviceTimer = setTimeout(async () => {
        // Automatically stop the streaming
        console.log(`Stopping livestream due to timeout.`);
        const stopStreaming = document.querySelector(`#disableStreaming`);
        const audioForm = document.getElementById('audioForm');
        await closeMicrophone();
        ws.close();
        stopStreaming.style.display = "none";
        document.getElementById('recording-status').style.display = "none";
        audioForm.style.display = "block";
    }, serviceTimerDuration);
}
const stopServiceTimer = () => {
    clearTimeout(serviceTimer);
}


let propresenterHost = "localhost";
let propresenterPort = "1025";
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
                body: JSON.stringify([
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
        const data = { serviceCode, transcript };
        controlSocket.emit('transcriptReady', data)
    }
}

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

    // select the initial value
    console.log(`Setting initial locale to ${selectedLocale}`);
    localeDropDown.value = selectedLocale;
}

let useInterim = false;
let pushToProPresenter = false;

window.addEventListener("load", async () => {
    const serviceId = document.getElementById('serviceId');
    const interimCheckbox = document.getElementById('interimCheckbox')
    const dynamicMonitorList = document.getElementById('dynamic-monitor-list')

    // Get any configuration properties we need to process from the server
    processConfigurationProperties();

    // Get the service code from the query parameter in the URL
    const url = new URL(location.href)
    console.log(`URL: ${url}`);
    const search = new URLSearchParams(url.search)
    const serviceIdentifier = search.get('id')


    // When we first load, generate a new Service ID if one isn't already defined
    if (sessionStorage.getItem('serviceId') === null && serviceIdentifier === null) {
        console.log(`No session storage and no query parameter, so auto-generating service ID`);
        serviceCode = generateRandomPin();
        sessionStorage.setItem('serviceId', serviceCode);
    } else if (serviceIdentifier != null) {
        serviceCode = serviceIdentifier;
    } else {
        console.log(`Getting service ID from session storage`);
        serviceCode = sessionStorage.getItem('serviceId');
    }
    console.log(`Room ID: ${serviceCode}`);
    sessionStorage.setItem('serviceId', serviceCode);
    serviceId.innerHTML = serviceCode;

    // Start sending heartbeats to the server
    startHeartbeatTimer();

    // Listen for subscriber changes
    controlSocket.emit('monitor', serviceCode);
    controlSocket.on(`${serviceCode}`, (json) => {
        //debug        console.log(`Subscriber change: ${JSON.stringify(json, null, 2)}`);

        // Update the list in the monitor, first clear out current entries
        while (dynamicMonitorList.firstChild) {
            dynamicMonitorList.removeChild(dynamicMonitorList.firstChild);
        }
        const languageArray = json.languages;
        if (languageArray !== undefined) {
            languageArray.forEach((language) => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>${getLanguageString(language.name)}:</strong> ${language.subscribers}`;
                dynamicMonitorList.appendChild(listItem);
            })
        }
    })

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

    // Get a QR Code for this service
    const qrcode = await getQRCode({ serviceId: serviceCode });
    const qrcodeBox = document.getElementById('qrcode-box');
    const parser = new DOMParser();
    const svgElement = parser.parseFromString(qrcode, 'image/svg+xml').documentElement;
    qrcodeBox.appendChild(svgElement);

    // Populate the dropdown lists of input languages
    setupSourceLanguage();

    setupDeepgram();

});