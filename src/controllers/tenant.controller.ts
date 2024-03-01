import { Request, Response } from "express";
import { Tenant } from "../entity/Tenant.entity.js";
import { AppDataSource } from "../data-source.js";
import { TenantService } from "../services/tenant.service.js";

export class TenantController {
    static async addTenant(req: Request, res: Response) {
        const { name, address, deepgram_api_key, deepgram_project } = req.body;

        // TBD - Validate inputs
        if (!name) {
            res.status(400).json({ message: `name must be defined` });
        } else {
            let tenant: Tenant = new Tenant();
            tenant.address = address;
            tenant.name = name;
            tenant.deepgram_api_key = deepgram_api_key;
            tenant.deepgram_project = deepgram_project;
            const serviceResponse = await TenantService.addTenant(tenant);

            res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
        }
    }
    static async getTenant(req: Request, res: Response) {
        const { id } = req.params;
        const serviceResponse = await TenantService.getTenant(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async getTenantIdByName(req: Request, res: Response) {
        try {
            const { name } = req.body;
            if (!name) throw new Error("Must include a name in the payload")

            const tenantRepository = AppDataSource.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({ where: { name } });
            if (tenant) {
                res.status(200).json({ tenant });
            } else {
                res.status(200).json({});
            }
        } catch (error) {
            console.warn(`Error getting Tenant by name: ${error}`);
            return res.status(400).json({ message: "Unable to get Id for Tenant" });
        }
    }
    static async uploadLogo(req: Request, res: Response) {
        try {
            console.log(`Uploaded logo: ${req.file}`);
            res.status(200).json({ message: "logo uploaded" });
        } catch (error) {
            return res.status(400).json({ message: "Unable to upload logo for tenant" });
        }
    }
}