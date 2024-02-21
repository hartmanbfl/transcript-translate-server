import pkg from "jsonwebtoken";
const { sign } = pkg;
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
dotenv.config();
const { JWT_SECRET = "" } = process.env;
export class encrypt {
    static async encryptPassword(password) {
        return bcrypt.hashSync(password, 12);
    }
    static comparePassword(hashPassword, password) {
        return bcrypt.compare(password, hashPassword);
    }
    static generateToken(payload) {
        return sign(payload, JWT_SECRET, { expiresIn: "1d" });
    }
}
