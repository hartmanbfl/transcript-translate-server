import { AppDataSource } from "../data-source.js";
import { AppThemingData } from "../entity/AppThemingData.entity.js";
import { DatabaseFile } from "../entity/DatabaseFile.entity.js";
import { ApiResponseType } from "../types/apiResonse.types.js";
import { DatabaseFilesService } from "./databaseFiles.service.js";

export class ThemingService {
    static async getTheme(id: string) {
        try {
            const themeRepository = AppDataSource.getRepository(AppThemingData);
            const theme = await themeRepository.findOne({where: {id}});
            if (!theme) throw new Error("No theming data for this id");

            return {
                success: true,
                statusCode: 200,
                message: `Found theme`,
                responseObject: {
                    theme: theme
                }
            }
        } catch (error) {
            console.log(`error: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Theme not found`,
                responseObject: {
                    theme: null
                }
            }
        }
    }
    static async getTenantTheme(tenantId: string): Promise<ApiResponseType<AppThemingData>> {
        try {

            const themeRepository = AppDataSource.getRepository(AppThemingData);
            const theme = await themeRepository
                .createQueryBuilder('theme')
                .innerJoin('theme.tenant', 'tenant')
                .where('tenant.id = :tenantId', { tenantId })
                .limit(1)
                .getMany();

            return {
                success: true,
                statusCode: 200,
                message: `Theme for tenant obtained successfully`,
                responseObject: theme[0] 
            }    
        } catch (error) {
            console.log(`Error: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Could not obtain theme data for this tenant`,
                responseObject: null 
            }
        }
    }
    static async updateTheme(id: string, newTheme: AppThemingData) {
        try {
            const themeRepository = AppDataSource.getRepository(AppThemingData);
            // get the current record
            const currentTheme = await themeRepository.findOne({where: {id}});
            if (!currentTheme || currentTheme.id != id) throw new Error("Theme not found in DB")

            
            await themeRepository.upsert(newTheme,['id']);

            return {
                success: true,
                statusCode: 200,
                message: `Theme set successfully`,
                responseObject: {
                    theme: newTheme
                }
            }
        } catch (error) {
            return {
                success: false,
                statusCode: 400,
                message: `Theme not set successfully`,
                responseObject: {
                    theme: null
                }
            }
        }
    }
    static async addLogo(themeId: string, imageBuffer: Buffer, filename: string) {
        try {
            const themeRepository = AppDataSource.getRepository(AppThemingData);
            const theme = await themeRepository.findOne({ where: { id: themeId } });
            
            const logo: DatabaseFile = await DatabaseFilesService.uploadDatabaseFile(imageBuffer, filename);
            console.log(`Updating logo for theme: ${themeId}`);
            await themeRepository.update(themeId, {logoId: logo.id} );

            return {
                success: true,
                statusCode: 200,
                message: `Logo updated successfully`,
                responseObject: {
                    theme: theme
                }
            }
        } catch (error) {
            console.warn(`Error adding logo: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Error adding logo to theme`,
                responseObject: {
                    theme: null
                }
            }
        }
    } 
}