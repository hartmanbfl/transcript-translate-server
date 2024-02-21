import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.entity.js";
export const authorization = (roles) => {
    return async (req, res, next) => {
        const userRepo = AppDataSource.getRepository(User);
        const jwt = req.token;
        const user = await userRepo.findOne({
            where: { id: jwt.id },
        });
        if (user == null || !roles.includes(user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};
