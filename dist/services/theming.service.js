import { AppDataSource } from "../data-source.js";
import { AppThemingData } from "../entity/AppThemingData.entity.js";
export class ThemingService {
    static async getTheme(id) {
        try {
            const themeRepository = AppDataSource.getRepository(AppThemingData);
            const theme = await themeRepository.findOne({ where: { id } });
            if (!theme)
                throw new Error("No theming data for this id");
            return {
                success: true,
                statusCode: 200,
                message: `Found theme`,
                responseObject: {
                    theme: theme
                }
            };
        }
        catch (error) {
            console.log(`error: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Theme not found`,
                responseObject: {
                    theme: null
                }
            };
        }
    }
    static async updateTheme(id, newTheme) {
        try {
            const themeRepository = AppDataSource.getRepository(AppThemingData);
            // get the current record
            const currentTheme = await themeRepository.findOne({ where: { id } });
            if (!currentTheme || currentTheme.id != id)
                throw new Error("Theme not found in DB");
            await themeRepository.upsert(newTheme, ['id']);
            return {
                success: true,
                statusCode: 200,
                message: `Theme set successfully`,
                responseObject: {
                    theme: newTheme
                }
            };
        }
        catch (error) {
            return {
                success: false,
                statusCode: 400,
                message: `Theme not set successfully`,
                responseObject: {
                    theme: null
                }
            };
        }
    }
}
