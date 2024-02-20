import { configurationService, getLanguages, getLivestreamStatus, infoService, statusService } from "../services/church.js";
export const infoController = async (req, res) => {
    const serviceResponse = await infoService();
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
export const configurationController = async (req, res) => {
    const serviceResponse = await configurationService();
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
export const statusController = async (req, res) => {
    const serviceResponse = await statusService(req.params.serviceId);
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
export const livestreamController = async (req, res) => {
    const serviceResponse = await getLivestreamStatus(req.params.serviceId);
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
export const languagesController = async (req, res) => {
    const serviceResponse = await getLanguages(req.params.serviceId);
    res.status(serviceResponse.statusCode).json({ ...serviceResponse });
};
