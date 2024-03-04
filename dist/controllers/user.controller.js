import { AppDataSource } from '../data-source.js';
import { User } from '../entity/User.entity.js';
import { UserService } from '../services/user.service.js';
export class UserController {
    static async getUsers(req, res) {
        console.log(`Getting user from DB`);
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();
        return res.status(200).json({ data: users });
    }
    static async createUser(req, res) {
        const { fullname, username, email, password, role, tenant_id } = req.body;
        const user = new User();
        user.fullname = fullname;
        user.email = email;
        user.password = password;
        user.role = role;
        user.username = username;
        const serviceResponse = await UserService.createUser(user, tenant_id);
        return res.status(serviceResponse.statusCode).json({ ...serviceResponse.responseObject });
        //        try {
        //            if (!username || !password) throw new Error("Must have username and password");
        //
        //            const user = new User();
        //            const encryptedPassword = await encrypt.encryptPassword(password);
        //            if (role) user.role = role;
        //            user.fullname = fullname;
        //            user.username = username;
        //            user.password = encryptedPassword;
        //            user.email = email; 
        //
        //            // Assign to a tenant
        //            const tenantRepository = AppDataSource.getRepository(Tenant);
        //            const tenant = await tenantRepository.findOne({where: {id: tenant_id}});
        //            if (!tenant) throw new Error(`Tenant not found for this tenant ID`);
        //
        //            user.tenant = tenant; 
        //
        //            const userRepository = AppDataSource.getRepository(User);
        //            await userRepository.upsert(user, ["username"]);
        //
        //            const token = encrypt.generateToken({ id: user.id });
        //            return res.status(200).json({ message: "User created successfully", token, user });
        //
        //        } catch (error) {
        //            console.warn(`Error creating ${username}.  ${error}`);
        //            return res.status(400).json({ message: "Unable to create user" });
        //        }
    }
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: {
                    id
                }
            });
            if (!user)
                throw new Error("Unable to find this user to delete");
            await userRepository.delete(user);
            return res.status(200).json({ message: `Successfully deleted user` });
        }
        catch (error) {
            return res.status(400).json({ message: "Could not delete user" });
        }
    }
}
