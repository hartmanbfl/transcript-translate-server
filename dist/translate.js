var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import * as dotenv from 'dotenv';
import translate from 'google-translate-api-x';
import { TranslationServiceClient } from '@google-cloud/translate';
import { transcriptAvailServiceSub } from './globals.js';
dotenv.config();
var TRANSLATE;
var parent;
if (process.env.USE_GOOGLE_TRANSLATE_SUBSCRIPTION === "true") {
    console.log("Using a subscription based Google Translate Key");
    TRANSLATE = new TranslationServiceClient();
    TRANSLATE.getProjectId().then(function (result) {
        parent = "projects/".concat(result);
        console.log("Setting project to: ".concat(parent));
    });
}
else {
    console.log("Using a limited free Google Translate version.");
}
var translateText = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var lang, transcript, request, _a, response, translatedText, _b, _c, translation, error_1;
    var e_1, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                lang = data.lang, transcript = data.transcript;
                request = {
                    contents: [transcript],
                    parent: parent,
                    mimeType: 'text/plain',
                    targetLanguageCode: lang
                };
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                return [4 /*yield*/, TRANSLATE.translateText(request)];
            case 2:
                _a = __read.apply(void 0, [_e.sent(), 1]), response = _a[0];
                translatedText = '';
                try {
                    for (_b = __values(response.translations), _c = _b.next(); !_c.done; _c = _b.next()) {
                        translation = _c.value;
                        translatedText = translatedText + ' ' + translation.translatedText;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_d = _b.return)) _d.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return [2 /*return*/, translatedText];
            case 3:
                error_1 = _e.sent();
                console.log("Error in translateText: ".concat(error_1));
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var distributeTranslation = function (data) {
    var io = data.io, channel = data.channel, translation = data.translation;
    try {
        if (process.env.DEBUG_TRANSLATION)
            console.log("Sending on ".concat(channel, ", Cloud translated-> ").concat(translation));
        io.to(channel).emit("translation", translation);
    }
    catch (error) {
        console.log("Error in distribute translation: ".concat(error));
    }
};
function translateTextAndDistribute(data) {
    return __awaiter(this, void 0, void 0, function () {
        var io, channel, lang, transcript, translated, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    io = data.io, channel = data.channel, lang = data.lang, transcript = data.transcript;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, translate(transcript, { to: lang })];
                case 2:
                    translated = _a.sent();
                    // @ts-ignore - using free google translate
                    console.log("Sending ".concat(lang, " to ").concat(channel, ", transcript-> ").concat(transcript, " : translated-> ").concat(translated.text));
                    // @ts-ignore - using free google translate
                    io.to(channel).emit("translation", translated.text);
                    // @ts-ignore - using free google translate
                    return [2 /*return*/, translated.text];
                case 3:
                    error_2 = _a.sent();
                    console.error("Caught error in translateTextAndDistribute: ".concat(error_2));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Service based methods
// data = {io, serviceId} 
export var registerForServiceTranscripts = function (data) {
    var io = data.io, serviceId = data.serviceId, serviceLanguageMap = data.serviceLanguageMap, serviceSubscriptionMap = data.serviceSubscriptionMap;
    // Check if we have already registered
    if (serviceSubscriptionMap.get(serviceId) !== undefined && serviceSubscriptionMap.get(serviceId) === true) {
        console.log("Already registered so returning.");
        return;
    }
    // Initialize the service  
    console.log("Initializing language map for service: ".concat(serviceId));
    serviceLanguageMap.set(serviceId, []);
    serviceSubscriptionMap.set(serviceId, true);
    // Subscribe to a RxJs Subject to detect when transcripts are available
    var subscription = transcriptAvailServiceSub.subscribe(function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var serviceCode, transcript, serviceLanguageMap, channel, languagesForChannel;
        return __generator(this, function (_a) {
            serviceCode = data.serviceCode, transcript = data.transcript, serviceLanguageMap = data.serviceLanguageMap;
            if (process.env.DEBUG_TRANSCRIPT)
                console.log("Received transcript: ".concat(serviceCode, " ").concat(transcript));
            channel = "".concat(serviceCode, ":transcript");
            io.to(channel).emit("transcript", transcript);
            languagesForChannel = serviceLanguageMap.get(serviceCode);
            if (typeof languagesForChannel === 'undefined') {
                return [2 /*return*/];
            }
            // Now iterate over the languages, getting and emitting the translation
            if (process.env.EXTRA_DEBUGGING) {
                console.log("Current languagesForChannel: ");
                printLanguageMap(serviceLanguageMap);
            }
            languagesForChannel.forEach(function (lang) { return __awaiter(void 0, void 0, void 0, function () {
                var translation, ioChannel, ioChannel, data_1, translation;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(process.env.USE_GOOGLE_TRANSLATE_SUBSCRIPTION === "true")) return [3 /*break*/, 2];
                            return [4 /*yield*/, translateText({ lang: lang, transcript: transcript })];
                        case 1:
                            translation = _a.sent();
                            ioChannel = "".concat(serviceCode, ":").concat(lang);
                            distributeTranslation({ io: io, channel: ioChannel, translation: translation });
                            return [3 /*break*/, 4];
                        case 2:
                            ioChannel = "".concat(serviceCode, ":").concat(lang);
                            data_1 = { io: io, channel: ioChannel, lang: lang, transcript: transcript };
                            return [4 /*yield*/, translateTextAndDistribute(data_1)];
                        case 3:
                            translation = _a.sent();
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    }); });
};
export var printLanguageMap = function (myMap) {
    var e_2, _a;
    var _loop_1 = function (key, value) {
        if (typeof value === 'undefined') {
            console.log("No languages defined yet for service ".concat(key));
            return { value: void 0 };
        }
        // value should be an array of strings
        value.forEach((function (val) {
            console.log("key: ".concat(key, ", lang: ").concat(val));
        }));
    };
    try {
        for (var _b = __values(myMap.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), key = _d[0], value = _d[1];
            var state_1 = _loop_1(key, value);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
};
export var printSubscribersPerLanguage = function (data) {
    var io = data.io;
    var serviceId = data.serviceId;
    var serviceLanguageMap = data.serviceLanguageMap;
    try {
        var languagesForChannel = serviceLanguageMap.get(serviceId);
        languagesForChannel.forEach(function (language) {
            var room = "".concat(serviceId, ":").concat(language);
            var subscribers = io.sockets.adapter.rooms.get(room).size;
            console.log("Subscribers for ".concat(language, ": ").concat(subscribers));
        });
    }
    catch (error) {
        console.log("Error printing subscribers");
    }
};
// data = {serviceId, language}
export var addTranslationLanguageToService = function (data) {
    var serviceId = data.serviceId, language = data.language, serviceLanguageMap = data.serviceLanguageMap;
    if (serviceLanguageMap.get(serviceId) === undefined) {
        var langArray = [language];
        serviceLanguageMap.set(serviceId, langArray);
    }
    else {
        // only add language if it doesn't already exist
        var langArray = serviceLanguageMap.get(serviceId);
        if (langArray.indexOf(language) == -1) {
            langArray.push(language);
            serviceLanguageMap.set(serviceId, langArray);
        }
    }
};
// data = {serviceId, language}
export var removeTranslationLanguageFromService = function (data) {
    var serviceId = data.serviceId, language = data.language, serviceLanguageMap = data.serviceLanguageMap;
    var index = serviceLanguageMap.get(serviceId).indexOf(language);
    if (index !== -1) {
        serviceLanguageMap.get(serviceId).splice(index, 1);
    }
};
