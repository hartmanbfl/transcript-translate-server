import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseApiKey } from '../repositories/google.repository.js';
import { UserService } from './user.service.js';
import { AppDataSource } from '../data-source.js';
import { User } from '../entity/User.entity.js';
import { encrypt } from '../utils/encrypt.util.js';
import jwt from 'jsonwebtoken';
// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
const firebaseConfig = {
    apiKey: getFirebaseApiKey()
};
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
dotenv.config();
const USE_DATABASE = process.env.USE_DATABASE || false;
const SECRET_KEY = process.env.JWT_SECRET || "NOT_DEFINED";
export class ApiAuthService {
    static async login(username, password) {
        try {
            if (!username || !password) {
                throw new Error(`Username and password are required`);
            }
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { username } });
            if (!user)
                throw new Error("User not found");
            const isPasswordValid = await encrypt.comparePassword(user.password, password);
            if (!user || !isPasswordValid) {
                throw new Error(`Invalid credentials`);
            }
            // Generate a token
            //            const token = encrypt.generateToken({ id: user.id });
            const token = jwt.sign(({ id: user.id, role: user.role }), SECRET_KEY);
            return {
                success: true,
                statusCode: 200,
                message: "Successful Login",
                responseObject: {
                    message: "Login successful",
                    user: user,
                    token: token
                }
            };
        }
        catch (error) {
            console.error(error);
            return {
                success: false,
                statusCode: 400,
                message: "Invalid login credentials",
                responseObject: { message: `Login error: ${error}` }
            };
        }
    }
}
export const loginService = async (login) => {
    try {
        await signInWithEmailAndPassword(firebaseAuth, login.email, login.password);
        let token = undefined;
        // If using the DB, also log in locally (note passwords have to match with Firebase)
        if (USE_DATABASE) {
            // Make sure user exists
            const user = await UserService.getUserByEmail(login.email);
            if (!user)
                throw new Error(`No user found with this email`);
            const apiLogin = await ApiAuthService.login(user.username, login.password);
            console.log(`User logged in with token: ${apiLogin.responseObject.token}`);
            token = apiLogin.responseObject.token;
        }
        if (login.id != null && login.id.length > 0) {
            return {
                success: true,
                statusCode: 200,
                message: `User logged in successfully to service ${login.id}`,
                responseObject: {
                    path: `/control?id=${login.id}`,
                    token: token
                }
            };
        }
        else {
            return {
                success: true,
                statusCode: 200,
                message: `User logged in successfully`,
                responseObject: {
                    path: `/control`,
                    token: token
                }
            };
        }
    }
    catch (error) {
        console.error(error);
        return {
            success: false,
            statusCode: 401,
            message: `User login failed`,
            responseObject: {
                path: `/`
            }
        };
    }
};
export const logoutService = async () => {
    const signout = await firebaseAuth.signOut();
    return {
        success: true,
        statusCode: 200,
        message: `User logged out successfully`,
        responseObject: null
    };
};
//export const loginController = async (req, res) => {    
//    const { id, email, password } = req.body;
//    try {
//        await signInWithEmailAndPassword(firebaseAuth, email, password);
//        if (id != null && id.length > 0) {
//            res.redirect(`/control?id=${id}`);
//        } else {
//            res.redirect(`/control`);
//        }
//    } catch (error) {
//        console.error(error);
//        //      res.status(401).send('Unauthorized');
//        res.redirect('/');
//    }
//}
