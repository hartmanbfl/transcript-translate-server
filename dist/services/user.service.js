var _a;
import * as dotenv from "dotenv";
import { encrypt } from "../utils/encrypt.util.js";
import { User } from "../entity/User.entity.js";
import { AppDataSource } from "../data-source.js";
import { Tenant } from "../entity/Tenant.entity.js";
dotenv.config();
const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
export class UserService {
}
_a = UserService;
UserService.createSuperadminUser = async (tenantId) => {
    try {
        if (!ADMIN_USERNAME || !ADMIN_PASSWORD)
            throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be defined");
        const user = new User();
        const encryptedPassword = await encrypt.encryptPassword(ADMIN_PASSWORD);
        user.fullname = "System Admin";
        user.username = ADMIN_USERNAME;
        user.password = encryptedPassword;
        user.role = "superadmin";
        const tenantRepository = AppDataSource.getRepository(Tenant);
        const tenant = await tenantRepository.findOne({ where: { id: tenantId } });
        if (!tenant)
            throw new Error("Tenant not found");
        user.tenant = tenant;
        const userRepository = AppDataSource.getRepository(User);
        await userRepository.upsert(user, ["username"]);
    }
    catch (error) {
        console.error(`Unable to create admin user in DB: ${error}`);
    }
};
UserService.createUser = async (user, tenant_id) => {
    const { username, password, role, fullname, email } = user;
    try {
        if (!username || !password)
            throw new Error("Must have username and password");
        const newUser = new User();
        const encryptedPassword = await encrypt.encryptPassword(password);
        if (role)
            newUser.role = role;
        newUser.fullname = fullname;
        newUser.username = username;
        newUser.password = encryptedPassword;
        newUser.email = email;
        // Assign to a tenant
        const tenantRepository = AppDataSource.getRepository(Tenant);
        const tenant = await tenantRepository.findOne({ where: { id: tenant_id } });
        if (!tenant)
            throw new Error(`Tenant not found for this tenant ID`);
        newUser.tenant = tenant;
        const userRepository = AppDataSource.getRepository(User);
        await userRepository.upsert(newUser, ["username"]);
        const token = encrypt.generateToken({ id: newUser.id });
        return {
            success: true,
            statusCode: 200,
            message: `User created successfully`,
            responseObject: {
                user: newUser,
                token: token
            }
        };
    }
    catch (error) {
        console.warn(`Error creating ${username}.  ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `User not created successfully`,
            responseObject: {
                user: null,
            }
        };
    }
};
UserService.getUserByEmail = async (email) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { email } });
        if (!user)
            throw new Error(`User not found`);
        return user;
    }
    catch (error) {
        return null;
    }
};
UserService.getCurrentUser = async (userId) => {
    try {
        const user = await AppDataSource
            .getRepository(User)
            .createQueryBuilder('user')
            .where('user.id = :userId', { userId })
            .getOne();
        return {
            success: true,
            statusCode: 200,
            message: `Successfully obtained users`,
            responseObject: user
        };
    }
    catch (error) {
        console.log(`Error: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `${error}`,
            responseObject: null
        };
    }
};
UserService.getAllUsers = async () => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.tenant', 'tenant')
            .getMany();
        return {
            success: true,
            statusCode: 200,
            message: `Successfully obtained users`,
            responseObject: users
        };
    }
    catch (error) {
        console.log(`Error: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `${error}`,
            responseObject: []
        };
    }
};
UserService.getAllTenantUsers = async (tenantId) => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('user.tenant', 'tenant')
            .where('tenant.id = :tenantId', { tenantId })
            .getMany();
        return {
            success: true,
            statusCode: 200,
            message: `Successfully obtained users`,
            responseObject: users
        };
    }
    catch (error) {
        console.log(`Error: ${error}`);
        return {
            success: false,
            statusCode: 400,
            message: `${error}`,
            responseObject: []
        };
    }
};
