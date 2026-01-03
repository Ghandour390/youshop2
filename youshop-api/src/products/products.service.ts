import { Injectable, Inject } from '@nestjs/common';
import prisma from 'lib/prisma';
import { REDIS_CLIENT } from './redis.module';
import Redis from 'ioredis';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly minioService: MinioService,
  ) {}

  async create(productDto: any, images?: Express.Multer.File[]) {
    const { quantity, ...productData } = productDto;
    const data: any = { ...productData };
    
    if (quantity !== undefined) {
      data.inventory = { create: { quantity } };
    }
    
    const product = await prisma.product.create({
      data,
      include: {
        category: true,
        inventory: true,
      },
    });

    if (images?.length) {
      for (const image of images) {
        const imageUrl = await this.minioService.uploadImage(image);
        await prisma.productImage.create({
          data: { productId: product.id, imageUrl },
        });
      }
    }
    
    return prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, inventory: true, images: true },
    });
  }

  async findAll() {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        inventory: true,
        images: true,
      },
    });

    for (const product of products) {
      if (product.inventory) {
        const reservedQty = await this.redis.get(`product:${product.id}:reserved`);
        const reserved = reservedQty ? parseInt(reservedQty) : 0;
        (product as any).availableQuantity = product.inventory.quantity - reserved;
      }
      if (product.images?.length) {
        for (const img of product.images) {
          (img as any).url = await this.minioService.getImageUrl(img.imageUrl);
        }
      }
    }

    return products;
  }

  async findOne(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        inventory: true,
        images: true,
      },
    });

    if (product && product.inventory) {
      const reservedQty = await this.redis.get(`product:${id}:reserved`);
      const reserved = reservedQty ? parseInt(reservedQty) : 0;
      (product as any).availableQuantity = product.inventory.quantity - reserved;
    }
    
    if (product?.images?.length) {
      for (const img of product.images) {
        (img as any).url = await this.minioService.getImageUrl(img.imageUrl);
      }
    }

    return product;
  }

  async update(id: number, dataUpdateProductDto: any, images?: Express.Multer.File[]) {
    const { quantity, ...productData } = dataUpdateProductDto;
    const data: any = { ...productData };
    
    if (quantity !== undefined) {
      data.inventory = {
        upsert: {
          create: { quantity },
          update: { quantity },
        },
      };
    }
    
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        inventory: true,
      },
    });

    if (images?.length) {
      for (const image of images) {
        const imageUrl = await this.minioService.uploadImage(image);
        await prisma.productImage.create({
          data: { productId: id, imageUrl },
        });
      }
    }
    
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, inventory: true, images: true },
    });
  }

  async remove(id: number) {
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: { images: true },
    });
    
    if (product?.images?.length) {
      for (const img of product.images) {
        await this.minioService.deleteImage(img.imageUrl);
      }
    }
    
    return prisma.product.delete({ where: { id } });
  }
}
