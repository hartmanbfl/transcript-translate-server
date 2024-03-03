import "reflect-metadata"
import { DataSource } from "typeorm"

import { AppThemingData } from "./entity/AppThemingData.entity.js";
import { DatabaseFile } from "./entity/DatabaseFile.entity.js";
import { Tenant } from "./entity/Tenant.entity.js"
import { User } from "./entity/User.entity.js";

import * as dotenv from "dotenv";
import path from 'path';
import {fileURLToPath} from 'url';
import { Phrase } from "./entity/Phrase.entity.js";
import { Transcript } from "./entity/Transcript.entity.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;

export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: parseInt(DB_PORT || "5432"),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: [
        AppThemingData,
        DatabaseFile,
        Phrase,
        Tenant,
        Transcript,
        User
    ],
    migrations: [__dirname + "migration/*.ts"],
    subscribers: [],
})
