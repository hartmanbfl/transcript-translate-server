import { configurationService, getLanguages, getLivestreamStatus, infoService, statusService } from "../services/church.service.js";
export class ChurchController {
    static async getServiceInfo(req, res) {
        const serviceResponse = await infoService();
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getConfigration(req, res) {
        const serviceResponse = await configurationService();
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getStatus(req, res) {
        const serviceResponse = await statusService(req.params.serviceId);
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getLivestreamStatus(req, res) {
        const serviceResponse = await getLivestreamStatus(req.params.serviceId);
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getLanguages(req, res) {
        const serviceResponse = await getLanguages(req.params.serviceId);
        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
}
