import { Request, Response } from "express";
import { configurationService, getLanguages, getLivestreamStatus, infoService, statusService } from "../services/church.js"
import { ApiResponseType } from "../types/apiResonse.js";
import { ChurchInfo } from "../types/church.js";

export const infoController = async (req: Request, res: Response) => {
    const serviceResponse: ApiResponseType<ChurchInfo> = await infoService();

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}
export const configurationController = async (req: Request, res: Response) => {
    const serviceResponse = await configurationService();

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}
export const statusController = async (req: Request, res: Response) => {
    const serviceResponse = await statusService(req.params.serviceId);

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}
export const livestreamController = async (req: Request, res: Response) => {
    const serviceResponse = await getLivestreamStatus(req.params.serviceId);

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}
export const languagesController = async (req: Request, res: Response) => {
    const serviceResponse = await getLanguages(req.params.serviceId);

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}
