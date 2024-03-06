import { Request } from "express";

export interface TokenInterface {
    id: string;
    role: string;
    tenantId: string;
}

// Allow expansion of express Request type
export interface CustomRequest extends Request {
    token: string | TokenInterface;
}
