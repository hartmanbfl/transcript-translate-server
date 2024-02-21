import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.entity.js"
import { JwtPayload } from "jsonwebtoken";

// Allow expansion of express Request type
export interface CustomRequest extends Request {
    token: string | JwtPayload;
}

export const authorization = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userRepo = AppDataSource.getRepository(User);
        const jwt = (req as CustomRequest).token as JwtPayload;
        const user = await userRepo.findOne({
            where: { id: jwt.id},
        });
        if (user == null || !roles.includes(user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};