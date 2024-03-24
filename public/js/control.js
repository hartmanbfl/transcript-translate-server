const oneMinute = 1 * 60 * 1000;
const fiveMinutes = 5 * 60 * 1000;


// Use the control namespace to communicate to the server via WSS.
const controlSocket = io('/control', { autoConnect: false });

let selectedLocale = "en-GB";
let defaultServiceCode = null;
let serviceCode;
let streamingStatus = "offline";
let serviceTimer;
let serviceInterval;
let healthInterval;
let serviceTimerDuration = 90 * 60 * 1000; // default to 90 minutes

let use_endpointing = localStorage.getItem('USE_ENDPOINTING') != null ? localStorage.getItem('USE_ENDPOINTING') : false;
let currentPhrase = [];

const languages = [
    {
        key: "af",
        value: "🇿🇦 Afrikaans"
    },
    {
        key: "sq",
        value: "🇦🇱 Albanian"
    },
    {
        key: "am",
        value: "🇪🇹 Amharic"
    },
    {
        key: "ar",
        value: "🇸🇦 Arabic"
    },
    {
        key: "hy",
        value: "🇦🇲 Armenian"
    },
    {
        key: "az",
        value: "🇦🇿 Azerbaijani"
    },
    {
        key: "eu",
        value: "🇪🇸 Basque"
    },
    {
        key: "be",
        value: "🇧🇾 Belarusian"
    },
    {
        key: "bn",
        value: "🇧🇩 Bengali"
    },
    {
        key: "bs",
        value: "🇧🇦 Bosnian"
    },
    {
        key: "bg",
        value: "🇧🇬 Bulgarian"
    },
    {
        key: "ca",
        value: "🇨🇦 Catalan"
    },
    {
        key: "ceb",
        value: "🇵🇭 Cebuano"
    },
    {
        key: "ny",
        value: "🇲🇼 Chichewa"
    },
    {
        key: "zh",
        value: "🇨🇳 Chinese (Simplified)"
    },
    {
        key: "zh",
        value: "🇹🇼 Chinese (Traditional)"
    },
    {
        key: "co",
        value: "🇫🇷 Corsican"
    },
    {
        key: "hr",
        value: "🇭🇷 Croatian"
    },
    {
        key: "cs",
        value: "🇨🇿 Czech"
    },
    {
        key: "da",
        value: "🇩🇰 Danish"
    },
    {
        key: "nl",
        value: "🇳🇱 Dutch"
    },
    {
        key: "en",
        value: "🇺🇸 English"
    },
    {
        key: "eo",
        value: "🇪🇸 Esperanto"
    },
    {
        key: "et",
        value: "🇪🇪 Estonian"
    },
    {
        key: "fil",
        value: "🇵🇭 Filipino"
    },
    {
        key: "fi",
        value: "🇫🇮 Finnish"
    },
    {
        key: "fr",
        value: "🇫🇷 French"
    },
    {
        key: "fy",
        value: "🇳🇱 Frisian"
    },
    {
        key: "gl",
        value: "🇪🇸 Galician"
    },
    {
        key: "ka",
        value: "🇬🇪 Georgian"
    },
    {
        key: "de",
        value: "🇩🇪 German"
    },
    {
        key: "el",
        value: "🇬🇷 Greek"
    },
    {
        key: "gu",
        value: "🇮🇳 Gujarati"
    },
    {
        key: "ht",
        value: "🇭🇹 Haitian Creole"
    },
    {
        key: "ha",
        value: "🇳🇬 Hausa"
    },
    {
        key: "haw",
        value: "🇺🇸 Hawaiian"
    },
    {
        key: "he",
        value: "🇮🇱 Hebrew"
    },
    {
        key: "hi",
        value: "🇮🇳 Hindi"
    },
    {
        key: "hmn",
        value: "🇨🇳 Hmong"
    },
    {
        key: "hu",
        value: "🇭🇺 Hungarian"
    },
    {
        key: "is",
        value: "🇮🇸 Icelandic"
    },
    {
        key: "ig",
        value: "🇳🇬 Igbo"
    },
    {
        key: "id",
        value: "🇮🇩 Indonesian"
    },
    {
        key: "ga",
        value: "🇮🇪 Irish"
    },
    {
        key: "it",
        value: "🇮🇹 Italian"
    },
    {
        key: "ja",
        value: "🇯🇵 Japanese"
    },
    {
        key: "jv",
        value: "🇮🇩 Javanese"
    },
    {
        key: "kn",
        value: "🇮🇳 Kannada"
    },
    {
        key: "kk",
        value: "🇰🇿 Kazakh"
    },
    {
        key: "km",
        value: "🇰🇭 Khmer"
    },
    {
        key: "ko",
        value: "🇰🇷 Korean"
    },
    {
        key: "ku",
        value: "🇰🇼 Kurdish"
    },
    {
        key: "ky",
        value: "🇰🇬 Kyrgyz"
    },
    {
        key: "lo",
        value: "🇱🇦 Lao"
    },
    {
        key: "la",
        value: "🇻🇦 Latin"
    },
    {
        key: "lv",
        value: "🇱🇻 Latvian"
    },
    {
        key: "lt",
        value: "🇱🇹 Lithuanian"
    },
    {
        key: "lb",
        value: "🇱🇺 Luxembourgish"
    },
    {
        key: "mk",
        value: "🇲🇰 Macedonian"
    },
    {
        key: "mg",
        value: "🇲🇬 Malagasy"
    },
    {
        key: "ms",
        value: "🇲🇾 Malay"
    },
    {
        key: "ml",
        value: "🇮🇳 Malayalam"
    },
    {
        key: "mt",
        value: "🇲🇹 Maltese"
    },
    {
        key: "mi",
        value: "🇳🇿 Maori"
    },
    {
        key: "mr",
        value: "🇮🇳 Marathi"
    },
    {
        key: "mn",
        value: "🇲🇳 Mongolian"
    },
    {
        key: "my",
        value: "🇲🇲 Myanmar (Burmese)"
    },
    {
        key: "ne",
        value: "🇳🇵 Nepali"
    },
    {
        key: "no",
        value: "🇳🇴 Norwegian"
    },
    {
        key: "ps",
        value: "🇦🇫 Pashto"
    },
    {
        key: "fa",
        value: "🇮🇷 Persian"
    },
    {
        key: "pl",
        value: "🇵🇱 Polish"
    },
    {
        key: "pt",
        value: "🇧🇷 Portuguese (Brazil)"
    },
    {
        key: "pt",
        value: "🇵🇹 Portuguese (Portugal)"
    },
    {
        key: "pa",
        value: "🇮🇳 Punjabi"
    },
    {
        key: "ro",
        value: "🇷🇴 Romanian"
    },
    {
        key: "ru",
        value: "🇷🇺 Russian"
    },
    {
        key: "sm",
        value: "🇦🇸 Samoan"
    },
    {
        key: "gd",
        value: "🇬🇧 Scots Gaelic"
    },
    {
        key: "sr",
        value: "🇷🇸 Serbian"
    },
    {
        key: "st",
        value: "🇱🇸 Sesotho"
    },
    {
        key: "sn",
        value: "🇿🇼 Shona"
    },
    {
        key: "sd",
        value: "🇵🇰 Sindhi"
    },
    {
        key: "si",
        value: "🇱🇰 Sinhala"
    },
    {
        key: "sk",
        value: "🇸🇰 Slovak"
    },
    {
        key: "sl",
        value: "🇸🇮 Slovenian"
    },
    {
        key: "so",
        value: "🇸🇴 Somali"
    },
    {
        key: "es",
        value: "🇪🇸 Spanish"
    },
    {
        key: "su",
        value: "🇮🇩 Sundanese"
    },
    {
        key: "sw",
        value: "🇹🇿 Swahili"
    },
    {
        key: "sv",
        value: "🇸🇪 Swedish"
    },
    {
        key: "tg",
        value: "🇹🇯 Tajik"
    },
    {
        key: "ta",
        value: "🇮🇳 Tamil"
    },
    {
        key: "te",
        value: "🇮🇳 Telugu"
    },
    {
        key: "th",
        value: "🇹🇭 Thai"
    },
    {
        key: "tr",
        value: "🇹🇷 Turkish"
    },
    {
        key: "uk",
        value: "🇺🇦 Ukrainian"
    },
    {
        key: "ur",
        value: "🇵🇰 Urdu"
    },
    {
        key: "uz",
        value: "🇺🇿 Uzbek"
    },
    {
        key: "vi",
        value: "🇻🇳 Vietnamese"
    },
    {
        key: "cy",
        value: "🇬🇧 Welsh"
    },
    {
        key: "xh",
        value: "🇿🇦 Xhosa"
    },
    {
        key: "yi",
        value: "🇾🇪 Yiddish"
    },
    {
        key: "yo",
        value: "🇳🇬 Yoruba"
    },
    {
        key: "zu",
        value: "🇿🇦 Zulu"
    }
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
            if (localStorage.getItem('selectedAudioDevice') != null) {
                audioInputSelect.value = localStorage.getItem('selectedAudioDevice');
            }
        })
        .catch((error) => {
            console.error(error);
        });
    audioInputSelect.addEventListener("change", () => {
        localStorage.setItem('selectedAudioDevice', audioInputSelect.value);
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
    } else {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
}

const setupDeepgram = () => {
    const audioForm = document.getElementById('audioForm');
    audioForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        await getMicrophone();

        const churchKey = document.querySelector('#key').value;
        const serviceId = sessionStorage.getItem('serviceId');

        // Validate the key with server/Deepgram
        const resp = await fetch('/deepgram/auth', {
            method: 'POST',
            body: JSON.stringify({ serviceId, churchKey }),
            headers: { 'Content-Type': 'application/json' }
        }).then(r => r.json()).catch(error => alert(error))

        if (resp.error) return alert(resp.error);


        document.querySelector('#audioForm').style.display = "none";

        const deepgramUrl = buildDeepgramUrl();
        ws = new WebSocket(deepgramUrl, ['token', resp.responseObject.deepgramToken])
        ws.onopen = startStreamingToDeepgram;
        ws.onmessage = handleDeepgramResponse;
        ws.onclose = () => {
            console.log(`WebSocket to Deepgram closed`);
            streamingStatus = "offline";
            console.log(`Stop streaming due to websocket closure`);
            stopStreamingToDeepgram();
        }

        const stopStreaming = document.querySelector(`#disableStreaming`);
        stopStreaming.style.display = "block";
        stopStreaming.addEventListener('click', async () => {
            stopServiceTimers();
            await closeMicrophone();
            ws.close();
            stopStreaming.style.display = "none";
            document.getElementById('recording-status').style.display = "none";
            audioForm.style.display = "block";
        })

        // Store values in local storage in case of a refresh
        localStorage.setItem('churchKey', churchKey);

    });
}

const getQRCode = async (data) => {
    const serviceId = data.serviceId;
    console.log(`Service ID: ${serviceId}, Data: ${JSON.stringify(data)}`);

    const resp = await fetch('/qrcode/generate', {
        method: 'POST',
        body: JSON.stringify({ serviceId }),
        headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json()).catch(error => alert(error))

    if (resp.error) return alert(resp.error);

    return resp.responseObject.qrCode;
}

const processConfigurationProperties = async () => {
    const resp = await fetch('/church/configuration', {
        method: 'GET'
    }).then(r => r.json())
        .catch(error => alert(error));

    if (resp.error) {
        console.log(`Error fetching configuration: ${resp.error}`);
        return alert(resp.error);
    }

    console.log(`Response: ${JSON.stringify(resp)}`);
    const data = resp.responseObject;
    const serviceTimeout = data.serviceTimeout;
    selectedLocale = data.hostLanguage;
    defaultServiceCode = data.defaultServiceId;
    serviceTimerDuration = parseInt(serviceTimeout) * 60 * 1000;
    console.log(`Setting service timeout to ${serviceTimerDuration / 1000} seconds and language to ${selectedLocale}.`);
}

const getLanguageString = (locale) => {
    const language = languageMap.get(locale);
    return (language == undefined) ? locale : language;
}

const buildDeepgramUrl = () => {
    const deepgramUrl = `wss://api.deepgram.com/v1/listen`;
    const locale = `language=${selectedLocale}`;
    const smartFormat = `smart_format=true`;
    const aiModel = `&model=nova-2`;

    return `${deepgramUrl}?${locale}&${smartFormat}${aiModel != null ? aiModel : ""}`;
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
    startServiceTimers();
}
const stopStreamingToDeepgram = async () => {
    const stopStreaming = document.querySelector(`#disableStreaming`);
    const audioForm = document.getElementById('audioForm');
    await closeMicrophone();
    if (typeof ws !== "undefined") {
        ws.close();
    }
    stopStreaming.style.display = "none";
    document.getElementById('recording-status').style.display = "none";
    audioForm.style.display = "block";

    // Also stop the other intervals 
    clearInterval(serviceInterval);
    clearInterval(healthInterval);

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

const startServiceTimers = () => {
    stopServiceTimers();
    startServiceTimer();
    startServiceInterval();
    startHealthInterval();
    console.log(`Starting service timer with duration ${serviceTimerDuration / 1000 / 60} minutes`)
}
const startServiceTimer = () => {
    serviceTimer = setTimeout(async () => {
        // Automatically stop the streaming
        console.log(`Stopping livestream due to timeout.`);
        stopStreamingToDeepgram();
    }, serviceTimerDuration);
}
const startServiceInterval = () => {
    let timeRemaining = serviceTimerDuration / 1000 / 60; // minutes
    serviceInterval = setInterval(() => {
        timeRemaining = timeRemaining - 1;
        console.log(`Time remaining: ${timeRemaining} minutes`);
    }, oneMinute);
}
const startHealthInterval = () => {
    healthInterval = setInterval(async () => {
        const health = await fetch('/health', {
            method: 'GET',
        });
    }, oneMinute);
}
const stopServiceTimers = () => {
    clearTimeout(serviceTimer);
    clearInterval(serviceInterval);
    clearInterval(healthInterval);
    console.log(`Cleared all service timers`);
}

let propresenterHost = "localhost";
let propresenterPort = "1025";
let previousTranscript = "";
const pushTranscriptToProPresenter = async (transcript) => {
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


const handleDeepgramResponse = async (message) => {
    const data = JSON.parse(message.data)
    const transcript = data.channel.alternatives[0].transcript
    const transcriptText = document.getElementById('transcript');
    const transcriptTextBox = document.getElementById('transcript-text-box');

    // NOTE:  if speech_final is true, is_final will always be true at this point in time
    //        as well
    let theEnd = false;
    let finalTranscript = transcript;
    if (transcript) {
        if (!use_endpointing) {
            if (data.is_final) theEnd = true;
        // If some of the transcript has been received but the speaker is still speaking
        } else if (data.is_final && !data.speech_final) {
            currentPhrase.push(transcript);
        // Full sentence is captured.  Need to rebuild the transcript    
        } else if (data.speech_final) {
            // reconstruct the transcript
            let tempTranscript = "";
            currentPhrase.forEach((phrase) => {
                tempTranscript = tempTranscript + phrase + " ";
            });
            finalTranscript = tempTranscript + transcript;
            currentPhrase = [];
            theEnd = true;
        }
    }

    if (theEnd) {
        if (localStorage.getItem('PRINT_FULL_DEEPGRAM_RESPONSE')) console.log(`DEEPGRAM RESPONSE: ${message.data}`);
        var item = document.createElement('li');
        item.textContent = finalTranscript;
        transcriptText.appendChild(item);
        transcriptText.scrollTop = transcriptText.scrollHeight;
        transcriptTextBox.scrollTo(0, transcriptText.scrollHeight);

        // If requested, push latest transcript to ProPresenter
        if (pushToProPresenter) {
            await pushTranscriptToProPresenter(finalTranscript);
        }

        // Send to our server
        const data = { serviceCode, transcript: finalTranscript };
        if (localStorage.getItem('PRINT_FULL_TRANSCRIPT')) console.log(`Emitting transcript ready: ${data.transcript}`);
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
        localStorage.setItem('selectedLocale', selectedLocale);
    });

    // select the initial value
    if (localStorage.getItem('selectedLocale') != null) {
        selectedLocale = localStorage.getItem('selectedLocale');
    }
    console.log(`Setting initial locale to ${selectedLocale}`);
    localeDropDown.value = selectedLocale;
}

let useInterim = false;
let pushToProPresenter = false;

window.addEventListener("load", async () => {
    const serviceId = document.getElementById('serviceId');
    const interimCheckbox = document.getElementById('interimCheckbox')
    const dynamicMonitorList = document.getElementById('dynamic-monitor-list')

    // Reload from local storage if available
    document.querySelector('#key').value = localStorage.getItem('churchKey');


    // Get any configuration properties we need to process from the server
    await processConfigurationProperties();

    // Get the service code from the query parameter in the URL
    const url = new URL(location.href)
    console.log(`URL: ${url}`);
    const search = new URLSearchParams(url.search)
    const serviceIdentifier = search.get('id')


    // When we first load, generate a new Service ID if one isn't already defined
    if (sessionStorage.getItem('serviceId') === null && serviceIdentifier === null && defaultServiceCode == null) {
        console.log(`No session storage and no query parameter, so auto-generating service ID`);
        serviceCode = generateRandomPin();
        sessionStorage.setItem('serviceId', serviceCode);
    } else if (serviceIdentifier != null) {
        serviceCode = serviceIdentifier;
    } else if (sessionStorage.getItem('serviceId') !== null) {
        console.log(`Getting service ID from session storage`);
        serviceCode = sessionStorage.getItem('serviceId');
    } else {
        console.log(`Using the default service ID of ${defaultServiceCode}`);
        serviceCode = defaultServiceCode;
    }
    console.log(`Room ID: ${serviceCode}`);
    sessionStorage.setItem('serviceId', serviceCode);
    serviceId.innerHTML = serviceCode;

    // Start communicating via websocket to the server
    controlSocket.connect();


    // Listen for subscriber changes
    controlSocket.on('connect', () => {
        console.log(`Control page connected to the control socket.io: ${controlSocket.id}`);
        // Start sending heartbeats to the server
        startHeartbeatTimer();
        // Register the service Code
        controlSocket.emit('monitor', serviceCode);
    })
    controlSocket.on('disconnect', (reason) => {
        console.log(`Control page disconnected from the control socket.io: ${controlSocket.id}, reason-> ${reason}`);
        console.log(`Stop streaming due to control socket disconnection`);
        stopStreamingToDeepgram();
    })
    controlSocket.on('subscribers', (json) => {
        //debug        console.log(`Received subscriber list: ${JSON.stringify(json, null, 2)}`);
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
