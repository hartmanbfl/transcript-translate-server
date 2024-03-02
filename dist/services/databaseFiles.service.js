import { AppDataSource } from "../data-source.js";
export class DatabaseFilesService {
    static async uploadDatabaseFile(dataBuffer, filename) {
        const fileRepository = AppDataSource.getRepository(DatabaseFilesService);
        const newFile = await fileRepository.create({
            filename,
            data: dataBuffer
        });
        await fileRepository.save(newFile);
        return newFile;
    }
    static async getFileById(fileId) {
        const fileRepository = AppDataSource.getRepository(DatabaseFilesService);
        const file = await fileRepository.findOne({ where: { id: fileId } });
        if (!file) {
            throw new Error("File not found");
        }
        return file;
    }
}
