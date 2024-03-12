import { Request, Response } from "express";
import { ApiAuthService, loginService, logoutService } from "../services/auth.service.js"
import { LoginType } from "../types/auth.types.js";
import jwt, { Secret } from 'jsonwebtoken';
import { TokenInterface } from "../types/token.types.js";


// Firebase Login
export class AuthenticationController {
    static async login(req: Request, res: Response) {
        try {

            const login: LoginType = req.body;
            const serviceResponse = await loginService(login);

            if (!serviceResponse.responseObject || !serviceResponse.responseObject.token) {
                throw new Error(`Token not defined for this login`);
            }
            const SECRET_KEY: Secret = process.env.JWT_SECRET!;

            // extract the tenant ID from the token and add it as a query string
            const token: string = serviceResponse.responseObject.token;
            const decoded = jwt.verify(token, SECRET_KEY);
            const tenantId = (decoded as TokenInterface).tenantId;
            const redirectPath =  serviceResponse.responseObject.path + "?tenantId=" + tenantId; 

            return res
                .cookie("access_token", serviceResponse.responseObject?.token, {
                    httpOnly: true,
                    secure: true
                })
                .redirect(redirectPath);
        } catch (error) {
            return res.redirect('/login');
        }
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
