import { AppDataSource } from "../data-source.js";
import { Tenant } from "../entity/Tenant.entity.js";

export class TenantService {

    static async addTenant(tenant: Tenant) {
        try {
            const tenantRepository = AppDataSource.getRepository(Tenant);
            await tenantRepository.upsert(tenant, ['name']);

            return {
                success: true,
                statusCode: 200,
                message: `Tenant created or added successfully`,
                responseObject: {
                    tenant: tenant
                }
            }
        } catch (error) {
            console.warn(`Error creating Tenant for ${name}.  ${error}`);
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
    static async addLogo(tenantId: string, imageBuffer: Buffer, filename: string) {
        const tenantRepository = AppDataSource.getRepository(Tenant);

    }
}
