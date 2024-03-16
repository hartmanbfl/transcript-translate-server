import { SubscriberService } from "../services/subscriber.service.js";
export class SubscriberController {
    static async getSubscribers(req, res) {
        const jwt = req.token;
        const serviceResponse = await SubscriberService.getSubscribers(jwt.tenantId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
    static async getSubscribersToService(req, res) {
        const { serviceId } = req.params;
        const jwt = req.token;
        const serviceResponse = await SubscriberService.getSubscribersToService(jwt.tenantId, serviceId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
}
