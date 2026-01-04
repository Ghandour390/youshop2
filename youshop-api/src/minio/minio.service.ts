import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    });
  }

  async uploadFile(bucketName: string, fileName: string, file: Buffer): Promise<string> {
    await this.minioClient.putObject(bucketName, fileName, file);
    return fileName;
  }

  async uploadImage(image: Express.Multer.File): Promise<string> {
    const fileName = `${Date.now()}-${image.originalname}`;
    await this.minioClient.putObject('products', fileName, image.buffer);
    return fileName;
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, fileName);
  }

  async deleteImage(fileName: string): Promise<void> {
    await this.minioClient.removeObject('products', fileName);
  }

  getFileUrl(bucketName: string, fileName: string): string {
    return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000/${bucketName}/${fileName}`;
  }

  async getImageUrl(fileName: string): Promise<string> {
    return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:9000/products/${fileName}`;
  }
}
