import { ApiAuthService, loginService, logoutService } from "../services/auth.service.js";
// Firebase Login
export class AuthenticationController {
    static async login(req, res) {
        var _a;
        const login = req.body;
        const serviceResponse = await loginService(login);
        //token in query string        const redirectPath = serviceResponse.responseObject != null ? serviceResponse.responseObject.path + "?token=" + serviceResponse.responseObject.token : '/login';
        const redirectPath = serviceResponse.responseObject != null ? serviceResponse.responseObject.path : '/login';
        return res
            .cookie("access_token", (_a = serviceResponse.responseObject) === null || _a === void 0 ? void 0 : _a.token, {
            httpOnly: true,
            secure: true
        })
            .redirect(redirectPath);
    }
    static async logout(req, res) {
        const serviceResponse = await logoutService();
        res.redirect("/login");
    }
}
// API usage login
export class ApiAuthController {
    static async login(req, res) {
        const { username, password } = req.body;
        const serviceResponse = await ApiAuthService.login(username, password);
        return res
            .cookie("access_token", serviceResponse.responseObject.token, {
            httpOnly: true,
            secure: true
        })
            .status(serviceResponse.statusCode)
            .json({ ...serviceResponse.responseObject });
    }
}
