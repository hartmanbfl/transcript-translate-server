import { Request, Response } from "express";
import { ChurchService, configurationService, getLanguages, getLivestreamStatus, getLivestreamStatusDb, infoService, statusService, statusServiceDb } from "../services/church.service.js"
import { ApiResponseType } from "../types/apiResonse.types.js";
import { ChurchInfo } from "../types/church.types.js";
import * as dotenv from 'dotenv';
import { CustomRequest, TokenInterface } from "../types/token.types.js";
import { ChurchProperties } from "../entity/ChurchProperties.entity.js";
import { generateUuid4 } from "../utils/index.util.js";

export class ChurchController {
    static async getServiceInfo(req: Request, res: Response) {
        try {

            dotenv.config();
            let serviceResponse: ApiResponseType<ChurchInfo>;
            // See if device-info cookie is set
            const deviceInfo = req.cookies['device-id'];
            if (deviceInfo) {
                console.log(`Device-ID set to: ${deviceInfo}`);
            } else {
                const id = generateUuid4();
                console.log(`Setting device cookie to ${id}`);
                // Development (localhost)
                res.cookie('device-id', id, { 
                    httpOnly: true, 
                    path: "/",
                    secure: true,
                    sameSite: "none", 
                    maxAge: 365 * 24 * 60 * 60 * 1000, 
                });
            }
            if (process.env.USE_DATABASE) {
                const tenantId = req.query.tenantId as string;
                if (!tenantId) throw new Error(`getServiceInfo: Tenant ID must be defined`)
                serviceResponse = await ChurchService.getChurchInfo(tenantId);
            } else {
                serviceResponse = await infoService();
            }

            res.status(serviceResponse.statusCode).json({ ...serviceResponse });
        } catch (error) {
            res.status(400).json({ error: error });
        }
    }
    static async getConfiguration(req: Request, res: Response) {
        dotenv.config();
        let serviceResponse: ApiResponseType<any>;
        if (process.env.USE_DATABASE) {
            const jwt = (req as CustomRequest).token as TokenInterface;
            serviceResponse = await ChurchService.getChurchConfiguration(jwt.tenantId);
        } else {
            serviceResponse = await configurationService();
        }

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getStatus(req: Request, res: Response) {
        const { serviceId } = req.params;
        let serviceResponse: ApiResponseType<any>;
        if (process.env.USE_DATABASE) {
            const tenantId = req.query.tenantId as string;
            serviceResponse = await statusServiceDb(tenantId, serviceId);
        } else {
            serviceResponse = await statusService(serviceId);
        }

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getLivestreamStatus(req: Request, res: Response) {
        const { serviceId } = req.params;
        let serviceResponse: ApiResponseType<any>;
        if (process.env.USE_DATABASE) {
            const jwt = (req as CustomRequest).token as TokenInterface;
            serviceResponse = await getLivestreamStatusDb(jwt.tenantId, serviceId);
        } else {
            serviceResponse = await getLivestreamStatus(serviceId);
        }

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async getLanguages(req: Request, res: Response) {
        const { roomId } = req.params;
        const tenantId = req.query.tenantId as string;
        const serviceResponse = await getLanguages(roomId, tenantId);

        res.status(serviceResponse.statusCode).json({ ...serviceResponse });
    }
    static async setConfiguration(req: Request, res: Response) {
        const { serviceTimeoutInMin, serviceId, sourceLanguage, targetLanguages } = req.body;
        const props: Partial<ChurchProperties> = {
            defaultServiceId: serviceId,
            serviceTimeoutInMin: serviceTimeoutInMin,
            defaultLanguage: sourceLanguage,
            translationLanguages: targetLanguages
        }
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await ChurchService.setChurchProperties(jwt.tenantId, props);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
}
