import { AppDataSource } from "../data-source.js";
import { AppThemingData } from "../entity/AppThemingData.entity.js";
import { DatabaseFile } from "../entity/DatabaseFile.entity.js";
import { Tenant } from "../entity/Tenant.entity.js";
import { DatabaseFilesService } from "./databaseFiles.service.js";

export class TenantService {

    static async addTenant(tenant: Tenant) {
        try {
            const tenantRepository = AppDataSource.getRepository(Tenant);

            // Create a blank theming reference 
            const theming: AppThemingData = new AppThemingData();
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
            }
        } catch (error) {
            console.warn(`Error creating Tenant for ${tenant.name}.  ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Unable to create tenant`,
                responseObject: {
                    tenant: null
                }
            }
        }
    }
    static async getTenant(tenantId: string) {
        try {
            const tenantRepository = AppDataSource.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
            if (!tenant) throw new Error("Tenant not found in DB");
            return {
                success: true,
                statusCode: 200,
                message: `Tenant found successfully`,
                responseObject: {
                    tenant: tenant
                }
            }

        } catch (error) {
            console.warn(`Error retrieving Tenant: ${error}`);
            return {
                success: false,
                statusCode: 400,
                message: `Error getting tenant`,
                responseObject: {
                    tenant: null
                }
            }
        }
    }
    
}
