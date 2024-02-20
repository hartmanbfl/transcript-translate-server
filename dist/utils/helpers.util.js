import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
dotenv.config();
const { JWT_SECRET = "" } = process.env;
export class encrypt {
    static async encryptpass(password) {
        return bcrypt.hashSync(password, 12);
    }
    static comparepassword(hashPassword, password) {
        return bcrypt.compare(password, hashPassword);
    }
}
