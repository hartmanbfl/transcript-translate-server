import { ApiAuthService, loginService, logoutService } from "../services/auth.service.js";
import jwt from 'jsonwebtoken';
// Firebase Login
export class AuthenticationController {
    static async login(req, res) {
        var _a;
        try {
            const login = req.body;
            const serviceResponse = await loginService(login);
            if (!serviceResponse.responseObject || !serviceResponse.responseObject.token) {
                throw new Error(`Token not defined for this login`);
            }
            const SECRET_KEY = process.env.JWT_SECRET;
            // extract the tenant ID from the token and add it as a query string
            const token = serviceResponse.responseObject.token;
            const decoded = jwt.verify(token, SECRET_KEY);
            const tenantId = decoded.tenantId;
            const redirectPath = serviceResponse.responseObject.path + "?tenantId=" + tenantId;
            return res
                .cookie("access_token", (_a = serviceResponse.responseObject) === null || _a === void 0 ? void 0 : _a.token, {
                httpOnly: true,
                secure: true
            })
                .redirect(redirectPath);
        }
        catch (error) {
            return res.redirect('/login');
        }
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
