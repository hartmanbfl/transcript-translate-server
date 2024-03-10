import { Request, Response } from "express";
import { ApiAuthService, loginService, logoutService } from "../services/auth.service.js"
import { LoginType } from "../types/auth.types.js";


// Firebase Login
export class AuthenticationController {
    static async login(req: Request, res: Response) {
        const login: LoginType = req.body;
        const serviceResponse = await loginService(login);
//token in query string        const redirectPath = serviceResponse.responseObject != null ? serviceResponse.responseObject.path + "?token=" + serviceResponse.responseObject.token : '/login';
        const redirectPath = serviceResponse.responseObject != null ? serviceResponse.responseObject.path  : '/login';

        return res
          .cookie("access_token", serviceResponse.responseObject?.token, {
            httpOnly: true,
            secure: true
          })
          .redirect(redirectPath);
    }
    static async logout(req: Request, res: Response) {
        const serviceResponse = await logoutService();
        res.redirect("/login");
    }
}

// API usage login
export class ApiAuthController {
    static async login(req: Request, res: Response) {
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
