import { NextFunction, Request, Response } from "express"
import { CustomRequest, TokenInterface } from "../types/token.types.js";

export const tenantCheck = (tenantId: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const jwt = (req as CustomRequest).token as TokenInterface;
        //console.log(`Authorizing: userId-> ${jwt.id}, role-> ${jwt.role}, tenantId-> ${jwt.tenantId}`);
        const allowedTenant = jwt.tenantId;

        if (allowedTenant == null || allowedTenant != tenantId) {
            return res.status(403).json({ message: "Forbidden to access this Tenant" });
        }
        next();
    };
};