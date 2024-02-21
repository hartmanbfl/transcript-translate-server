import { Request, Response } from "express";
import { configurationService, getLanguages, getLivestreamStatus, infoService, statusService } from "../services/church.service.js"
import { ApiResponseType } from "../types/apiResonse.types.js";
import { ChurchInfo } from "../types/church.types.js";

export class ChurchController {
    static async getServiceInfo(req: Request, res: Response) {
        const serviceResponse: ApiResponseType<ChurchInfo> = await infoService();

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getConfigration(req: Request, res: Response) {
        const serviceResponse  = await configurationService();

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getStatus(req: Request, res: Response) {
        const serviceResponse = await statusService(req.params.serviceId);

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getLivestreamStatus(req: Request, res: Response) {
        const serviceResponse = await getLivestreamStatus(req.params.serviceId);

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getLanguages(req: Request, res: Response) {
        const serviceResponse = await getLanguages(req.params.serviceId);

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
}
