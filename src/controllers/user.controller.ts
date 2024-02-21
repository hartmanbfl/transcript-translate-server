import { Request, Response } from 'express';
import { AppDataSource } from '../data-source.js';
import { User } from '../entity/User.entity.js';
import { encrypt } from '../utils/encrypt.util.js';

export class UserController {
    static async getUsers(req: Request, res: Response) {
        console.log(`Getting user from DB`);
        const userRepository = AppDataSource.getRepository(User);
        const users = await userRepository.find();

        return res.status(200).json({ data: users });
    }

    static async createUser(req: Request, res: Response) {
        const { fullname, username, email, password, role } = req.body;
        try {
            if (!username || !password) throw new Error("Must have username and password");

            const user = new User();
            const encryptedPassword = await encrypt.encryptPassword(password);
            if (role) user.role = role;
            user.fullname = fullname;
            user.username = username;
            user.password = encryptedPassword;
            user.email = email; 

            const userRepository = AppDataSource.getRepository(User);
            await userRepository.save(user);

            const token = encrypt.generateToken({ id: user.id });
            return res.status(200).json({ message: "User created successfully", token, user });

        } catch (error) {
            console.warn(`Error creating ${username}.  ${error}`);
            return res.status(400).json({ message: "Unable to create user" });
        }
    }
}
