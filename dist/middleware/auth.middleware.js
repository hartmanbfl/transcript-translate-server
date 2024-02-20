// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirebaseApiKey } from '../repositories/google.repository.js';
// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
const firebaseConfig = {
    apiKey: getFirebaseApiKey()
};
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
    const idParam = req.query.id;
    const user = firebaseAuth.currentUser;
    if (user !== null || process.env.TEST_MODE === "true") {
        next();
    }
    else {
        if (idParam != null) {
            res.redirect(`/login?id=${idParam}`);
        }
        else {
            res.redirect(`/login`);
        }
    }
};
