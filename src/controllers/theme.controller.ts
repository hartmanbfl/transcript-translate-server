import { Request, Response } from "express";
import { AppThemingData } from "../entity/AppThemingData.entity.js";
import { ThemingService } from "../services/theming.service.js";

export class ThemeController {
    static async getTheme(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) throw new Error("missing id");

        const serviceResponse = await ThemingService.getTheme(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.theme);

    }
    static async update(req: Request, res: Response) {
        const { id } = req.params;
        const { greeting, message, additional_welcome_message, waiting_message } = req.body;
        if (!id) throw new Error("missing id");

        // Build the Entity
        const theme: AppThemingData = new AppThemingData();
        theme.greeting = greeting;
        theme.message = message;
        theme.additional_welcome_message = additional_welcome_message;
        theme.waiting_message = waiting_message;
        theme.id = id;

        const serviceResponse = await ThemingService.updateTheme(id, theme);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.theme);
    }
}