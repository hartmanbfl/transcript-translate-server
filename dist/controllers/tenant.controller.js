import { Tenant } from "../entity/Tenant.entity.js";
import { AppDataSource } from "../data-source.js";
import { TenantService } from "../services/tenant.service.js";
import { ThemingService } from "../services/theming.service.js";
import { AppThemingData } from "../entity/AppThemingData.entity.js";
export class TenantController {
    static async addTenant(req, res) {
        const { name, address, deepgram_api_key, deepgram_project } = req.body;
        // TBD - Validate inputs
        if (!name) {
            res.status(400).json({ message: `name must be defined` });
        }
        else {
            let tenant = new Tenant();
            tenant.address = address;
            tenant.name = name;
            tenant.deepgram_api_key = deepgram_api_key;
            tenant.deepgram_project = deepgram_project;
            const serviceResponse = await TenantService.addTenant(tenant);
            res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
        }
    }
    static async getTenant(req, res) {
        const { id } = req.params;
        const serviceResponse = await TenantService.getTenant(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async getThemeId(req, res) {
        try {
            const { id } = req.params;
            const tenantRepository = AppDataSource.getRepository(Tenant);
            const tenant = await tenantRepository.findOne({ where: { id } });
            res.status(200).json(tenant === null || tenant === void 0 ? void 0 : tenant.app_theming_data_id);
        }
        catch (error) {
            res.status(400).json({ message: error });
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
    static async addTheming(req, res) {
        const { id } = req.params;
        const { greeting, additional_welcome_message } = req.body;
        const newTheme = new AppThemingData();
        newTheme.greeting = greeting;
        newTheme.additional_welcome_message = additional_welcome_message;
        const serviceResponse = await ThemingService.updateTheme(id, newTheme);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.theme);
    }
    static async uploadLogo(req, res) {
        try {
            console.log(`Uploaded logo: ${req.file}`);
            res.status(200).json({ message: "logo uploaded" });
        }
        catch (error) {
            return res.status(400).json({ message: "Unable to upload logo for tenant" });
        }
    }
}
