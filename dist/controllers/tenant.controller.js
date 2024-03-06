import { Tenant } from "../entity/Tenant.entity.js";
import { AppDataSource } from "../data-source.js";
import { TenantService } from "../services/tenant.service.js";
import { ThemingService } from "../services/theming.service.js";
import { AppThemingData } from "../entity/AppThemingData.entity.js";
export class TenantController {
    static async addTenant(req, res) {
        const { name, address, church_key, deepgram_api_key, deepgram_project } = req.body;
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
            tenant.church_key = church_key;
            const serviceResponse = await TenantService.addTenant(tenant);
            res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
        }
    }
    static async getTenant(req, res) {
        const { id } = req.params;
        const serviceResponse = await TenantService.getTenant(id);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async getAllTenants(req, res) {
        const serviceResponse = await TenantService.getAllTenants();
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async getTenantIdByName(req, res) {
        const { name } = req.body;
        if (!name)
            throw new Error("Must include a name in the payload");
        const serviceResponse = await TenantService.getTenantByName(name);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
    }
    static async getTenantIdByKey(req, res) {
        const { church_key } = req.body;
        if (!church_key)
            throw new Error("Must include a key in the payload");
        const serviceResponse = await TenantService.getTenantByChurchKey(church_key);
        res.status(serviceResponse.statusCode).json(serviceResponse.responseObject.tenant);
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
}
