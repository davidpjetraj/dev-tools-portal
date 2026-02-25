import {
    BadRequestException,
    Controller,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { AuthRest } from '../decorators/auth.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import type { Express } from 'express';

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly filesService: FilesService) { }

    @AuthRest()
    @Post('upload-files')
    @ApiOperation({ summary: 'Upload multiple files (Images, PDFs, Office docs)' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
            limits: { fileSize: 1024 * 1024 * 10 }, // 10MB per file
        }),
    )
    async uploadFile(
        @UploadedFiles() files: { files: Array<Express.Multer.File> },
    ) {
        const allowedMimeTypes = [
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        if (files?.files && files.files.length > 0) {
            for (const file of files.files) {
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    throw new BadRequestException(
                        `File type ${file.mimetype} is not allowed`,
                    );
                }
            }
        } else {
            throw new BadRequestException('No files provided');
        }

        return await this.filesService.uploadFiles(files.files);
    }

    @AuthRest()
    @Post('upload-documents')
    @ApiOperation({ summary: 'Upload private documents' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'files', maxCount: 5 }], {
            limits: { fileSize: 1024 * 1024 * 100 }, // 100MB
        }),
    )
    async uploadPrivateFile(
        @UploadedFiles() files: { files: Array<Express.Multer.File> },
    ) {
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf',
            'application/vnd.oasis.opendocument.text',
            'text/plain',
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
            'image/tiff',
            'image/bmp',
        ];

        if (files?.files && files.files.length > 0) {
            for (const file of files.files) {
                if (!allowedMimeTypes.includes(file.mimetype)) {
                    throw new BadRequestException(
                        `File type ${file.mimetype} is not allowed for documents`,
                    );
                }
            }
        } else {
            throw new BadRequestException('No files provided');
        }

        return await this.filesService.uploadPrivateFiles(files.files);
    }
}
