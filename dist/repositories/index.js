import * as dotenv from 'dotenv';
dotenv.config();
// Create maps to track the languages per Service
export var serviceLanguageMap = new Map();
export var serviceSubscriptionMap = new Map();
// Also track the subscriptions per room { Subscriber: Room[] }
export var clientSubscriptionMap = new Map();
// For each room (e.g. 5555:fr or 1:transcript) get the list of subscribers (socket IDs)
export var roomSubscriptionMap = new Map();
// Streaming status per Service
export var streamingStatusMap = new Map();
export var getDebabelClientUrl = function () {
    return process.env.DEBABEL_CLIENT_URL;
};
