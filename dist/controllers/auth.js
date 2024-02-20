import { loginService, logoutService } from "../services/auth.js";
export const loginController = async (req, res) => {
    const login = req.body;
    const serviceResponse = await loginService(login);
    const redirectPath = serviceResponse.responseObject != null ? serviceResponse.responseObject.path : '/login';
    res.redirect(redirectPath);
};
export const logoutController = async (req, res) => {
    const serviceResponse = await logoutService();
    res.redirect("/login");
};
