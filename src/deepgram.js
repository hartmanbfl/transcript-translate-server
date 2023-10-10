// Deepgram needs to be imported as CommonJS
import pkg from "@deepgram/sdk";
const { Deepgram } = pkg;
import { transcriptSubject } from "./globals.js";

const client = new Deepgram(process.env.DEEPGRAM_API_KEY);

let keepAlive;

export const setupDeepgram = (io) => {
    const deepgramLive = client.transcription.live({
        language: "en",
        smart_format: true,
        interim_results: false,
        model: "nova"
    });
    // Listeners
    deepgramLive.addListener("close", () => {
        console.log(`Connection to deepgram closed`);
        io.emit('deepgram_state', 3);
    });
    deepgramLive.addListener("open", () => {
        console.log(`Connection to deepgram opened`);
        io.emit('deepgram_state', 1);
    })
    deepgramLive.addListener("error", (error) => {
        console.log(`Connection to deepgram reported an error: ${error}`);
    })
    deepgramLive.addListener("transcriptReceived", (message) => {
        const data = JSON.parse(message);
        const { type } = data;
        switch (type) {
            case "Results":
                console.log("deepgram: transcript received");
                const transcript = data.channel.alternatives[0].transcript ?? ""; 
                transcriptSubject.next(transcript);
                io.emit("transcript", transcript);
                break;
            case "Metadata":
                console.log("deepgram: metadata received");
                break;
            default:
                console.log("deepgram: unknown packet received");
                break;
        }
    });
    return deepgramLive;
}

export const startupDeepgram = (deepgram) => {
    if (keepAlive) clearInterval(keepAlive);
    keepAlive = setInterval(() => {
        console.log("deepgram: keepalive");
        deepgram.keepAlive();
    }, 10 * 1000);
}

export const getCurrentDeepgramState = (deepgram) => {
    if (deepgram === undefined) return 3; // CLOSED
    return deepgram.getReadyState();
}

export const shutdownDeepgram = (deepgram) => {
    clearInterval(keepAlive);
    deepgram.finish();
}

let aborter;
export function abortStream() {
    aborter.abort();
}

export const sendMicStreamToDeepgram = (deepgram, audio) => {
    if (deepgram === undefined) {
        console.warn(`Cannot send mic data to deepgram because it is not currently connected`);
        return;
    }

    if (deepgram.getReadyState() === 1 /* OPEN */) {
        deepgram.send(audio);
    } else if (deepgram.getReadyState() >= 2 /* 2 = CLOSING, 3 = CLOSED */) {
        console.log("socket: data couldn't be sent to deepgram");
        console.log("socket: retrying connection to deepgram");
        /* Attempt to reopen the Deepgram connection */
        deepgram.finish();
//        deepgram.removeAllListeners();
//        deepgram = setupDeepgram(socket);
    } else {
        console.log("socket: data couldn't be sent to deepgram");
    }
}

export async function sendUrlStreamToDeepgram(deepgram, url) {

    aborter = new AbortController();
    const signal = aborter.signal;
    if (deepgram === undefined) {
        console.warn(`Cannot send url stream to deepgram because it is not currently connected`);
        return;
    }
    try {
        const response = await fetch(url, { signal });
        const body = response.body;
        const reader = body.getReader();
        while (true) {
            if (signal.aborted) throw signal.reason;
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            if (deepgram.getReadyState() === 1) {
                deepgram.send(value);
            }
        }
    } catch (e) {
        console.log(e);
    }
}
