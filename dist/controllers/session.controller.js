import { SessionService } from "../services/session.service.js";
export class SessionController {
    static async deleteEmptySessions(req, res) {
        const jwt = req.token;
        const serviceResponse = await SessionService.deleteEmptySessions(jwt.tenantId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
}
