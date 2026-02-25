import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { config } from '../config';

interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    size: number;
}

interface ResizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
    backgroundColor?: string; // Hex color for transparent backgrounds (default: #FFFFFF)
}

@Injectable()
export class StorageService {
    private storage: S3;
    private publicBucket = config.public_bucket;

    constructor() {
        this.storage = new S3({
            endpoint: config.storage_endpoint,
            region: config.storage_region,
            forcePathStyle: true, // Common for Minio/DigitalOcean/etc.
            credentials: {
                accessKeyId: config.storage_key,
                secretAccessKey: config.storage_secret,
            },
        });
    }

    async save({
        buffer,
        metadata = {},
        mimeType,
        saveUri,
    }: {
        buffer: Buffer;
        mimeType: string;
        metadata?: { [key: string]: any };
        saveUri?: string;
    }) {
        const extension = mimeType.split('/')[1] || 'bin';
        const uri = saveUri || `${new Date().toISOString().split('T')[0]}/${randomUUID()}.${extension}`;

        const bucket = this.publicBucket;

        await this.storage.send(
            new PutObjectCommand({
                Bucket: bucket,
                Key: uri,
                Body: buffer,
                ContentType: mimeType,
                Metadata: metadata,
                ACL: 'public-read',
            }),
        );

        if (config.cdn_endpoint) {
            // Ensure cdn_endpoint ends with a slash if needed, or handle it here
            const base = config.cdn_endpoint.endsWith('/') ? config.cdn_endpoint : `${config.cdn_endpoint}/`;
            return `${base}${uri}`;
        }

        return uri;
    }


    /**
     * Get image metadata including dimensions, format, and file size
     * @param file - The uploaded file to analyze
     * @returns Promise containing image metadata
     */
    async getImageMetadata(file: Express.Multer.File): Promise<ImageMetadata> {
        const metadata = await sharp(file.buffer).metadata();
        return {
            width: metadata.width || 0,
            height: metadata.height || 0,
            format: metadata.format || 'unknown',
            size: file.size,
        };
    }

    /**
     * Calculate optimal resize dimensions while maintaining aspect ratio
     */
    async calculateOptimalDimensions(
        originalWidth: number,
        originalHeight: number,
        maxWidth: number,
        maxHeight: number,
    ): Promise<{ width: number; height: number }> {
        if (originalWidth <= maxWidth && originalHeight <= maxHeight) {
            return { width: originalWidth, height: originalHeight };
        }

        const originalAspectRatio = originalWidth / originalHeight;
        const maxAspectRatio = maxWidth / maxHeight;

        let newWidth: number;
        let newHeight: number;

        if (originalAspectRatio > maxAspectRatio) {
            newWidth = maxWidth;
            newHeight = Math.round(maxWidth / originalAspectRatio);
        } else {
            newHeight = maxHeight;
            newWidth = Math.round(maxHeight * originalAspectRatio);
        }

        return { width: newWidth, height: newHeight };
    }

    /**
     * Resize image to fit within specified dimensions while maintaining aspect ratio
     */
    async resizeImage(
        file: Express.Multer.File,
        maxWidth: number,
        maxHeight: number,
        options: ResizeOptions = {},
    ): Promise<Buffer> {
        const metadata = await this.getImageMetadata(file);
        const { width: targetWidth, height: targetHeight } =
            await this.calculateOptimalDimensions(
                metadata.width,
                metadata.height,
                maxWidth,
                maxHeight,
            );

        const hasTransparency = this.hasTransparencySupport(metadata.format);
        const backgroundColor = options.backgroundColor || '#FFFFFF';
        const isGif = metadata.format.toLowerCase() === 'gif';

        let sharpInstance = sharp(file.buffer, {
            animated: isGif,
        });

        sharpInstance = sharpInstance.resize({
            width: targetWidth,
            height: targetHeight,
            fit: options.fit || 'inside',
            withoutEnlargement: true,
        });

        if (hasTransparency && !isGif) {
            sharpInstance = sharpInstance.flatten({ background: backgroundColor });
        }

        if (isGif) {
            return await sharpInstance.gif().toBuffer();
        } else {
            return await sharpInstance.jpeg({ quality: 90 }).toBuffer();
        }
    }

    private hasTransparencySupport(format: string): boolean {
        return ['png', 'webp', 'gif', 'svg'].includes(format.toLowerCase());
    }
}
