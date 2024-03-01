// Firebase
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, User, getAuth } from 'firebase/auth';
import { getFirebaseApiKey } from '../repositories/google.repository.js';
import { NextFunction, Request, Response, RequestHandler } from 'express';

import jwt, { Secret, JwtPayload } from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

// Allow expansion of express Request type
export interface CustomRequest extends Request {
    token: string | JwtPayload;
}

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
    const user: User | null = firebaseAuth.currentUser;
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

// Local authentication for API calls 
export const authentication = (req: Request, res: Response, next: NextFunction) => {
    try {
        const SECRET_KEY: Secret = process.env.JWT_SECRET!;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error(); 
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        (req as CustomRequest).token = decoded;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthenticated" });
    }
}