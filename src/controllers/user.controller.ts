import { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { User } from '../entity/User.entity.js';
import { UserService } from '../services/user.service.js';
import { CustomRequest, TokenInterface } from '../types/token.types.js';

export class UserController {
    static async getUsers(req: Request, res: Response) {
        const serviceResponse = await UserService.getAllUsers();

        return res.status(serviceResponse.statusCode).json(serviceResponse.responseObject);
    }
    static async getUsersForTenant(req: Request, res: Response) {
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await UserService.getAllTenantUsers(jwt.tenantId);

        return res.status(serviceResponse.statusCode).json( serviceResponse.responseObject );
    }
    static async getCurrentUser(req: Request, res: Response) {
        const jwt = (req as CustomRequest).token as TokenInterface;
        const serviceResponse = await UserService.getCurrentUser(jwt.id);

        return res.status(serviceResponse.statusCode).json( serviceResponse.responseObject );
    }

    static async createUser(req: Request, res: Response) {
        const { fullname, username, email, password, role, tenant_id } = req.body;
        const user = new User();
        user.fullname = fullname;
        user.email = email;
        user.password = password;
        user.role = role;
        user.username = username;
        const serviceResponse = await UserService.createUser(user, tenant_id);
        return res.status(serviceResponse.statusCode).json({...serviceResponse.responseObject});
    }
    static async deleteUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: {
                    id
                }
            });
            if (!user) throw new Error("Unable to find this user to delete");
            await userRepository.delete(user);
            return res.status(200).json({ message: `Successfully deleted user`});
        } catch (error) {
            return res.status(400).json({ message: "Could not delete user"});
        }
    }
}

