// Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirebaseApiKey } from '../repositories/google.js';
// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
var firebaseConfig = {
    apiKey: getFirebaseApiKey()
};
var firebaseApp = initializeApp(firebaseConfig);
var firebaseAuth = getAuth(firebaseApp);
// Middleware to check if user is authenticated
export var isAuthenticated = function (req, res, next) {
    var idParam = req.query.id;
    var user = firebaseAuth.currentUser;
    if (user !== null || process.env.TEST_MODE === "true") {
        next();
    }
    else {
        if (idParam != null) {
            res.redirect("/login?id=".concat(idParam));
        }
        else {
            res.redirect("/login");
        }
    }
};
