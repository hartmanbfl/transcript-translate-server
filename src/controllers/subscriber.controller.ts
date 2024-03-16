import { Request, Response } from "express";
import { SubscriberService } from "../services/subscriber.service.js";
import { CustomRequest, TokenInterface } from "../types/token.types.js";

export class SubscriberController {
    static async getSubscribers(req: Request, res: Response) {
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await SubscriberService.getSubscribers(jwt.tenantId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
    static async getSubscribersToService(req: Request, res: Response) {
        const { serviceId } = req.params;
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await SubscriberService.getSubscribersToService(jwt.tenantId, serviceId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
}