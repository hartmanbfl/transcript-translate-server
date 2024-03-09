import { AppThemingData } from "../entity/AppThemingData.entity.js";
import { ThemingService } from "../services/theming.service.js";
export class ThemeController {
    static async getTheme(req, res) {
        const { id } = req.params;
        if (!id)
            throw new Error("missing id");
        const serviceResponse = await ThemingService.getTheme(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.theme);
    }
    static async getTenantTheme(req, res) {
        const jwt = req.token;
        const serviceResponse = await ThemingService.getTenantTheme(jwt.tenantId);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
    static async update(req, res) {
        const { id } = req.params;
        const { greeting, message, additional_welcome_message, waiting_message } = req.body;
        if (!id)
            throw new Error("missing id");
        // Build the Entity
        const theme = new AppThemingData();
        theme.greeting = greeting;
        theme.message = message;
        theme.additional_welcome_message = additional_welcome_message;
        theme.waiting_message = waiting_message;
        theme.id = id;
        const serviceResponse = await ThemingService.updateTheme(id, theme);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.theme);
    }
    static async uploadLogo(req, res) {
        var _a;
        const { id } = req.params;
        console.log(`Uploaded logo: ${(_a = req.file) === null || _a === void 0 ? void 0 : _a.filename}`);
        const file = req.file;
        if (!file)
            throw new Error("File not defined");
        const serviceResponse = await ThemingService.addLogo(id, file === null || file === void 0 ? void 0 : file.buffer, file === null || file === void 0 ? void 0 : file.originalname);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.theme);
    }
}
