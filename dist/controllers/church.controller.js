import { ChurchService, configurationService, getLanguages, getLivestreamStatus, infoService, statusService } from "../services/church.service.js";
import * as dotenv from 'dotenv';
export class ChurchController {
    static async getServiceInfo(req, res) {
        try {
            dotenv.config();
            let serviceResponse;
            if (process.env.USE_DATABASE) {
                const tenantId = req.query.tenantId;
                if (!tenantId)
                    throw new Error(`getServiceInfo: Tenant ID must be defined`);
                serviceResponse = await ChurchService.getChurchInfo(tenantId);
            }
            else {
                serviceResponse = await infoService();
            }
            res.status(serviceResponse.statusCode).json({ ...serviceResponse });
        }
        catch (error) {
            res.status(400).json({ error: error });
        }
    }
    static async getConfiguration(req, res) {
        dotenv.config();
        let serviceResponse;
        if (process.env.USE_DATABASE) {
            const jwt = req.token;
            serviceResponse = await ChurchService.getChurchConfiguration(jwt.tenantId);
        }
        else {
            serviceResponse = await configurationService();
        }
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
    static async setConfiguration(req, res) {
        const { serviceTimeoutInMin, serviceId, sourceLanguage, targetLanguages } = req.body;
        const props = {
            defaultServiceId: serviceId,
            serviceTimeoutInMin: serviceTimeoutInMin,
            defaultLanguage: sourceLanguage,
            translationLanguages: targetLanguages
        };
        const jwt = req.token;
        const serviceResponse = await ChurchService.setChurchProperties(jwt.tenantId, props);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
}
