import { Tenant } from "../entity/Tenant.entity.js";
import { AppDataSource } from "../data-source.js";
export class TenantController {
    static async addTenant(req, res) {
        const { name, address, deepgram_api_key, deepgram_project } = req.body;
        try {
            if (!name)
                throw new Error("The Tenant must have a name in the payload");
            const tenant = new Tenant();
            tenant.name = name;
            tenant.address = address;
            tenant.deepgram_api_key = deepgram_api_key;
            tenant.deepgram_project = deepgram_project;
            const tenantRepository = AppDataSource.getRepository(Tenant);
            await tenantRepository.save(tenant);
            return res.status(200).json({ message: "Tenant created successfully", tenant });
        }
        catch (error) {
            console.warn(`Error creating Tenant for ${name}.  ${error}`);
            return res.status(400).json({ message: "Unable to create tenant" });
        }
    }
    static async getTenant(req, res) {
        try {
            const { id } = req.params;
            const tenantRepository = AppDataSource.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({ where: { id } });
            if (!tenant)
                throw new Error("Tenant not found in DB");
            res.status(200).json({ tenant });
        }
        catch (error) {
            console.warn(`Error retrieving Tenant: ${error}`);
            return res.status(400).json({ message: "Unable to retrieve tenant" });
        }
    }
    static async getTenantIdByName(req, res) {
        try {
            const { name } = req.body;
            if (!name)
                throw new Error("Must include a name in the payload");
            const tenantRepository = AppDataSource.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({ where: { name } });
            if (tenant) {
                res.status(200).json({ tenant });
            }
            else {
                res.status(200).json({});
            }
        }
        catch (error) {
            console.warn(`Error getting Tenant by name: ${error}`);
            return res.status(400).json({ message: "Unable to get Id for Tenant" });
        }
    }
}
