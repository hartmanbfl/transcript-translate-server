import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
};
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);

export const loginController = async (req, res) => {    
    const { id, email, password } = req.body;
    try {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        if (id != null && id.length > 0) {
            res.redirect(`/control?id=${id}`);
        } else {
            res.redirect(`/control`);
        }
    } catch (error) {
        console.error(error);
        //      res.status(401).send('Unauthorized');
        res.redirect('/');
    }
}

// Logout handler
export const logoutController = (req, res) => {
    firebaseAuth.signOut();
    res.redirect('/login');
}