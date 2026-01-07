import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private readonly bucketName = 'products';
  private readonly urlExpiry = 3600; // 1 hour

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    });
  }

  async uploadFile(bucketName: string, fileName: string, file: Buffer): Promise<string> {
    await this.minioClient.putObject(bucketName, fileName, file);
    return fileName;
  }

  async uploadImage(image: Express.Multer.File): Promise<string> {
    // Validate file type for security
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(image.mimetype)) {
      throw new Error('Invalid file type. Only images are allowed.');
    }
    
    // Sanitize filename to prevent path traversal
    const sanitizedName = image.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedName}`;
    await this.minioClient.putObject(this.bucketName, fileName, image.buffer, image.size, {
      'Content-Type': image.mimetype,
    });
    return fileName;
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, fileName);
  }

  async deleteImage(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  // Use presigned URLs instead of exposing internal endpoints
  async getFileUrl(bucketName: string, fileName: string): Promise<string> {
    return this.minioClient.presignedGetObject(bucketName, fileName, this.urlExpiry);
  }

  async getImageUrl(fileName: string): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucketName, fileName, this.urlExpiry);
  }
}
