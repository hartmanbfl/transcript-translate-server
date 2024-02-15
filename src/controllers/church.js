import { configurationService, infoService, statusService } from "../services/church.js"

export const infoController = async (req, res) => {
    const serviceResponse = await infoService();

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}
export const statusController = async (req, res) => {
    const serviceResponse = await statusService(req.query);

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}
export const configurationController = async (req, res) => {
    const serviceResponse = await configurationService();

    res.status(serviceResponse.statusCode).json({...serviceResponse});
}
