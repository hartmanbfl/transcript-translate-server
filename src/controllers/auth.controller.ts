import { Request, Response } from "express";
import { loginService, logoutService } from "../services/auth.service.js"
import { LoginType } from "../types/auth.types.js";

export const loginController = async(req: Request, res: Response) => {
    const login: LoginType = req.body;
    const serviceResponse = await loginService(login);
    const redirectPath = serviceResponse.responseObject != null ? serviceResponse.responseObject.path : '/login';

    res.redirect(redirectPath);
}

export const logoutController = async (req: Request, res: Response) => {
    const serviceResponse = await logoutService();
    res.redirect("/login");
}