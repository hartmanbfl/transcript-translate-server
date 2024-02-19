import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseApiKey } from '../repositories/google.js';

// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
const firebaseConfig = {
    apiKey: getFirebaseApiKey()
};
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

export const loginService = async ( { id, email, password }) => {
    try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (id != null && id.length > 0) {
            return {
                success: true,
                statusCode: 200,
                message: `User logged in successfully to service ${id}`,
                responseObject: {
                    path: `/control?id=${id}`
                }
            }
        } else {
            return {
                success: true,
                statusCode: 200,
                message: `User logged in successfully`,
                responseObject: {
                    path: `/control`
                }
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false,
            statusCode: 401,
            message: `User login failed`,
            responseObject: {
                path: `/`
            }
        }
    }
}

export const logoutService = async () => {
    const signout = await firebaseAuth.signOut();
    return {
        success: true,
        statusCode: 200,
        message: `User logged out successfully`,
        responseObject: null
    }
}

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