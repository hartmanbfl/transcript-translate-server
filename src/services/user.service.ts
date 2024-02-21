import * as dotenv from "dotenv"
import { encrypt } from "../utils/encrypt.util.js";
import { User } from "../entity/User.entity.js";
import { AppDataSource } from "../data-source.js";

dotenv.config();

const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

export const createSuperadminUser = async () => {
    try {
        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) throw new Error("ADMIN_USERNAME and ADMIN_PASSWORD must be defined");

        const user = new User();
        const encryptedPassword = await encrypt.encryptPassword(ADMIN_PASSWORD)
        user.fullname = "System Admin"
        user.username = ADMIN_USERNAME;
        user.password = encryptedPassword;
        user.role = "admin";

        const userRepository = AppDataSource.getRepository(User);
        await userRepository.upsert(user, ["username"]);

    } catch (error) {
        console.error(`Unable to create admin user in DB: ${error}`);
    }
}