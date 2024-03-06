import { Request, Response } from "express";
import { Tenant } from "../entity/Tenant.entity.js";
import { AppDataSource } from "../data-source.js";
import { TenantService } from "../services/tenant.service.js";
import { ThemingService } from "../services/theming.service.js";
import { AppThemingData } from "../entity/AppThemingData.entity.js";

export class TenantController {
    static async addTenant(req: Request, res: Response) {
        const { name, address, church_key, deepgram_api_key, deepgram_project } = req.body;

        // TBD - Validate inputs
        if (!name) {
            res.status(400).json({ message: `name must be defined` });
        } else {
            let tenant: Tenant = new Tenant();
            tenant.address = address;
            tenant.name = name;
            tenant.deepgram_api_key = deepgram_api_key;
            tenant.deepgram_project = deepgram_project;
            tenant.church_key = church_key; 
            const serviceResponse = await TenantService.addTenant(tenant);

            res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
        }
    }
    static async getTenant(req: Request, res: Response) {
        const { id } = req.params;
        const serviceResponse = await TenantService.getTenant(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async getAllTenants(req: Request, res: Response) {
        const serviceResponse = await TenantService.getAllTenants()
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async getTenantIdByName(req: Request, res: Response) {
        const { name } = req.body;
        if (!name) throw new Error("Must include a name in the payload")
        const serviceResponse = await TenantService.getTenantByName(name);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async getTenantIdByKey(req: Request, res: Response) {
        const { church_key } = req.body;
        if (!church_key) throw new Error("Must include a key in the payload")
        const serviceResponse = await TenantService.getTenantByChurchKey(church_key);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async addTheming(req: Request, res: Response) {
        const { id } = req.params;
        const { greeting, additional_welcome_message } = req.body;
        const newTheme = new AppThemingData();
        newTheme.greeting = greeting;
        newTheme.additional_welcome_message = additional_welcome_message;
        const serviceResponse = await ThemingService.updateTheme(id, newTheme);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.theme);
    }

    static async getThemeId(req: Request, res: Response) {
        try {

            const { id } = req.params;
            const tenantRepository = AppDataSource.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({ where: { id } });
            res.status(200).json(tenant?.app_theming_data_id);
        } catch (error) {
            res.status(400).json({ message: error })
        }
    }
}