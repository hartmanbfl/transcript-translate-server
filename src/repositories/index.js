import * as dotenv from 'dotenv';
dotenv.config();

// Create maps to track the languages per Service
export const serviceLanguageMap = new Map();
export const serviceSubscriptionMap = new Map();

// Also track the subscriptions per room { Subscriber: Room[] }
export const clientSubscriptionMap = new Map();
export const roomSubscriptionMap = new Map();

// Streaming status per Service
export const streamingStatusMap = new Map();

export const getDebabelClientUrl = () => {
    return process.env.DEBABEL_CLIENT_URL;
}