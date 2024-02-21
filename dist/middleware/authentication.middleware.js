// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirebaseApiKey } from '../repositories/google.repository.js';
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();
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
// Local authentication for API calls 
export const authentication = (req, res, next) => {
    var _a;
    try {
        const SECRET_KEY = process.env.JWT_SECRET;
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            throw new Error();
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        req.token = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};
