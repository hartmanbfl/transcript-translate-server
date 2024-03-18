import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source.js";
import { User } from "../entity/User.entity.js"
import { CustomRequest, TokenInterface } from "../types/token.types.js";


export const authorization = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const userRepo = AppDataSource.getRepository(User);
        const jwt = (req as CustomRequest).token as TokenInterface;
        //console.log(`Authorizing: userId-> ${jwt.id}, role-> ${jwt.role}, tenantId-> ${jwt.tenantId}`);

        // Note:  this may not be necessary since we can include the role in the JWT
        const user = await userRepo.findOne({
            where: { id: jwt.id},
        });
        if (user == null || !roles.includes(user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};