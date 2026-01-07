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
      // Upload images in parallel for better performance
      const uploadPromises = images.map(image => this.minioService.uploadImage(image));
      const imageUrls = await Promise.all(uploadPromises);
      
      await prisma.productImage.createMany({
        data: imageUrls.map(imageUrl => ({ productId: product.id, imageUrl })),
      });
    }
    
    return prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true, inventory: true, images: true },
    });
  }


  async findAll(categoryId?: number) {
    const where = categoryId ? { categoryId } : {};
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        inventory: true,
        images: true,
      },
    });

    // Batch Redis operations for better performance (avoid N+1)
    const productIds = products.map(p => p.id);
    const reservedKeys = productIds.map(id => `product:${id}:reserved`);
    
    // Single Redis call for all reserved quantities
    const reservedValues = reservedKeys.length > 0 
      ? await this.redis.mget(...reservedKeys) 
      : [];

    // Process all image URLs in parallel
    const imageUrlPromises: Promise<{ productId: number; imageId: number; url: string | null }>[] = [];
    
    for (const product of products) {
      if (product.images?.length) {
        for (const img of product.images) {
          imageUrlPromises.push(
            this.minioService.getImageUrl(img.imageUrl)
              .then(url => ({
                productId: product.id,
                imageId: img.id,
                url,
              }))
              .catch(() => ({
                productId: product.id,
                imageId: img.id,
                url: null,
              }))
          );
        }
      }
    }
    
    const imageUrls = await Promise.all(imageUrlPromises);
    const imageUrlMap = new Map(imageUrls.map(item => [`${item.productId}-${item.imageId}`, item.url]));

    // Assign values to products
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (product.inventory) {
        const reserved = reservedValues[i] ? parseInt(reservedValues[i]) : 0;
        (product as any).availableQuantity = product.inventory.quantity - reserved;
      }
      if (product.images?.length) {
        for (const img of product.images) {
          (img as any).url = imageUrlMap.get(`${product.id}-${img.id}`);
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
      // Get all image URLs in parallel
      const urlPromises = product.images.map(img => this.minioService.getImageUrl(img.imageUrl));
      const urls = await Promise.all(urlPromises);
      product.images.forEach((img, index) => {
        (img as any).url = urls[index];
      });
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
      // Upload images in parallel
      const uploadPromises = images.map(image => this.minioService.uploadImage(image));
      const imageUrls = await Promise.all(uploadPromises);
      
      await prisma.productImage.createMany({
        data: imageUrls.map(imageUrl => ({ productId: id, imageUrl })),
      });
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
      // Delete images in parallel
      await Promise.all(product.images.map(img => this.minioService.deleteImage(img.imageUrl)));
    }
    
    return prisma.product.delete({ where: { id } });
  }
}
