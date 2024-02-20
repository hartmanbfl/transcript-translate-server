import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();
const { JWT_SECRET = ""} = process.env;
export class encrypt {
    static async encryptpass(password: string) {
        return bcrypt.hashSync(password, 12);
    }
    static comparepassword(hashPassword: string, password: string) {
        return bcrypt.compare(password, hashPassword);
    }
}