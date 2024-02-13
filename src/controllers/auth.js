import { loginService, logoutService } from "../services/auth.js"

export const loginController = async(req, res) => {
    const serviceResponse = await loginService(req.body);
    const redirectPath = serviceResponse.responseObject.path;

    res.redirect(redirectPath);
}

export const logoutController = async (req, res) => {
    const serviceResponse = await logoutService();
    res.redirect("/login");
}