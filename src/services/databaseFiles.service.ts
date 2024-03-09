import { AppDataSource } from "../data-source.js";
import { DatabaseFile } from "../entity/DatabaseFile.entity.js";

export class DatabaseFilesService {
    static async uploadDatabaseFile(dataBuffer: Buffer, filename: string) {
        const fileRepository = AppDataSource.getRepository(DatabaseFile);
        const newFile = await fileRepository.create({
            filename,
            data: dataBuffer
        });
        await fileRepository.save(newFile);
        return newFile;
    }
    static async getFileById(fileId: string) {
        const fileRepository = AppDataSource.getRepository(DatabaseFile);
        const file = await fileRepository.findOne({where: {id: fileId}});
        if (!file) {
            throw new Error("File not found");
        }
        return file;
    }
    static convertByteaToBase64(bytea: Uint8Array) {
        const encodedStr: string = Buffer.from(bytea).toString("base64");
        return encodedStr;
    }
}