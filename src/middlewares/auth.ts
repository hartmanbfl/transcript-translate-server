// Firebase
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, User, getAuth } from 'firebase/auth';
import { getFirebaseApiKey } from '../repositories/google.js';
import { RequestHandler } from 'express';

// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
const firebaseConfig = {
    apiKey: getFirebaseApiKey() 
};
const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);
const firebaseAuth: Auth = getAuth(firebaseApp);

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
    const idParam = req.query.id;
    const user: User | null= firebaseAuth.currentUser;
    if (user !== null || process.env.TEST_MODE === "true") {
        next();
    } else {
        if (idParam != null) {
            res.redirect(`/login?id=${idParam}`);
        } else {
            res.redirect(`/login`);
        }
    }
}