var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseApiKey } from '../repositories/google.js';
// Firebase auth can be used to restrict access to certain pages of the
// web app (e.g. the control page)
var firebaseConfig = {
    apiKey: getFirebaseApiKey()
};
var firebaseApp = initializeApp(firebaseConfig);
var firebaseAuth = getAuth(firebaseApp);
export var loginService = function (login) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, signInWithEmailAndPassword(firebaseAuth, login.email, login.password)];
            case 1:
                _a.sent();
                if (login.id != null && login.id.length > 0) {
                    return [2 /*return*/, {
                            success: true,
                            statusCode: 200,
                            message: "User logged in successfully to service ".concat(login.id),
                            responseObject: {
                                path: "/control?id=".concat(login.id)
                            }
                        }];
                }
                else {
                    return [2 /*return*/, {
                            success: true,
                            statusCode: 200,
                            message: "User logged in successfully",
                            responseObject: {
                                path: "/control"
                            }
                        }];
                }
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error(error_1);
                return [2 /*return*/, {
                        success: false,
                        statusCode: 401,
                        message: "User login failed",
                        responseObject: {
                            path: "/"
                        }
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
export var logoutService = function () { return __awaiter(void 0, void 0, void 0, function () {
    var signout;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebaseAuth.signOut()];
            case 1:
                signout = _a.sent();
                return [2 /*return*/, {
                        success: true,
                        statusCode: 200,
                        message: "User logged out successfully",
                        responseObject: null
                    }];
        }
    });
}); };
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
