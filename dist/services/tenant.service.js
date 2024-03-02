import { AppDataSource } from "../data-source.js";
import { AppThemingData } from "../entity/AppThemingData.entity.js";
import { Tenant } from "../entity/Tenant.entity.js";
import { DatabaseFilesService } from "./databaseFiles.service.js";
export class TenantService {
    static async addTenant(tenant) {
        try {
            const tenantRepository = AppDataSource.getRepository(Tenant);
            // Create a blank theming reference 
            const theming = new AppThemingData();
            tenant.app_theming_data = theming;
            //            await tenantRepository.upsert(tenant, ['name']);
            await tenantRepository.save(tenant);
            return {
                success: true,
                statusCode: 200,
                message: `Tenant created successfully`,
                responseObject: {
                    tenant: tenant
                }
            };
        }
        catch (error) {
            console.warn(`Error creating Tenant for ${tenant.name}.  ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Unable to create tenant`,
                responseObject: {
                    tenant: null
                }
            };
        }
    }
    static async getTenant(tenantId) {
        try {
            const tenantRepository = AppDataSource.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
            if (!tenant)
                throw new Error("Tenant not found in DB");
            return {
                success: true,
                statusCode: 200,
                message: `Tenant found successfully`,
                responseObject: {
                    tenant: tenant
                }
            };
        }
        catch (error) {
            console.warn(`Error retrieving Tenant: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Error getting tenant`,
                responseObject: {
                    tenant: null
                }
            };
        }
    }
    static async addLogo(tenantId, imageBuffer, filename) {
        try {
            const tenantRepository = AppDataSource.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
            const themingRepository = AppDataSource.getRepository(AppThemingData);
            const logo = await DatabaseFilesService.uploadDatabaseFile(imageBuffer, filename);
            //            await themingRepository.update( )
            return {
                success: true,
                statusCode: 200,
                message: `Tenant found successfully`,
                responseObject: {
                    tenant: tenant
                }
            };
        }
        catch (error) {
            console.warn(`Error retrieving Tenant: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Error adding logo to tenant`,
                responseObject: {
                    tenant: null
                }
            };
        }
    }
}
