import { loginService, logoutService } from "../services/auth.service.js";
import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.entity.js";
import { encrypt } from "../utils/encrypt.util.js";
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
export class ApiAuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(500).json({ message: "username and password required" });
            }
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { username } });
            if (!user)
                throw new Error("User not found");
            const isPasswordValid = await encrypt.comparePassword(user.password, password);
            if (!user || !isPasswordValid) {
                return res.status(404).json({ message: "Invalid login credentials" });
            }
            // Generate a token
            const token = encrypt.generateToken({ id: user.id });
            return res.status(200).json({ message: "Login successful", user, token });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}
