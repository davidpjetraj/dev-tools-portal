import { BadRequestException, Injectable } from '@nestjs/common';
import { StorageService } from '../storage';

@Injectable()
export class FilesService {
    constructor(private readonly storageService: StorageService) { }

    async uploadFiles(files: Express.Multer.File[]): Promise<{ url: string }[]> {
        const data: { url: string }[] = [];

        for (const file of files) {
            const uploadedFile = await this.upload(file);
            data.push({ url: uploadedFile });
        }

        return data;
    }

    async upload(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        // Default to image/jpeg for general uploads if requested, 
        // but better to preserve mimeType from file.
        return await this.storageService.save({
            buffer: file.buffer,
            mimeType: file.mimetype,
        });
    }

    async uploadPrivateFiles(files: Express.Multer.File[]): Promise<any[]> {
        // Porting basic logic from vp-garage-server without Prisma integration for now
        // In dev-tools-portal, we might use Mongoose if we want to track files in DB.
        const fileDataArray = [];

        for (const file of files) {
            const url = await this.storageService.save({
                buffer: file.buffer,
                mimeType: file.mimetype,
            });

            fileDataArray.push({
                url,
                file_name: file.originalname,
                mimetype: file.mimetype,
                file_size: file.size,
            });
        }

        return fileDataArray;
    }
}
