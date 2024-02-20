import * as dotenv from 'dotenv';
dotenv.config();
// Create maps to track the languages per Service
export const serviceLanguageMap = new Map();
export const serviceSubscriptionMap = new Map();
// Also track the subscriptions per room { Subscriber: Room[] }
export const clientSubscriptionMap = new Map();
// For each room (e.g. 5555:fr or 1:transcript) get the list of subscribers (socket IDs)
export const roomSubscriptionMap = new Map();
// Streaming status per Service
export const streamingStatusMap = new Map();
export const getDebabelClientUrl = () => {
    return process.env.DEBABEL_CLIENT_URL;
};
