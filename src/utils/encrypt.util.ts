import pkg from "jsonwebtoken";
const { sign } = pkg;
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { payload } from '../dto/user.dto.js'

dotenv.config();
const { JWT_SECRET = ""} = process.env;
export class encrypt {
    static async encryptPassword(password: string) {
        return bcrypt.hashSync(password, 12);
    }
    static comparePassword(hashPassword: string, password: string) {
        return bcrypt.compare(password, hashPassword);
    }

    static generateToken(payload: payload) {
        return sign(payload, JWT_SECRET, { expiresIn: "1d" });
    }
}