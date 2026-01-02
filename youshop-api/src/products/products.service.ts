import { Injectable, Inject } from '@nestjs/common';
import prisma from 'lib/prisma';
import { REDIS_CLIENT } from './redis.module';
import Redis from 'ioredis';

@Injectable()
export class ProductsService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  create(productDto: any) {
    const { quantity, ...productData } = productDto;
    const data: any = { ...productData };
    if (quantity !== undefined) {
      data.inventory = { create: { quantity } };
    }
    return prisma.product.create({
      data,
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  async findAll() {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        inventory: true,
      },
    });

    // Add available quantity (DB - Redis reserved)
    for (const product of products) {
      if (product.inventory) {
        const reservedQty = await this.redis.get(`product:${product.id}:reserved`);
        const reserved = reservedQty ? parseInt(reservedQty) : 0;
        (product as any).availableQuantity = product.inventory.quantity - reserved;
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
      },
    });

    if (product && product.inventory) {
      const reservedQty = await this.redis.get(`product:${id}:reserved`);
      const reserved = reservedQty ? parseInt(reservedQty) : 0;
      (product as any).availableQuantity = product.inventory.quantity - reserved;
    }

    return product;
  }

  update(id: number, dataUpdateProductDto: any) {
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
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        inventory: true,
      },
    });
  }

  remove(id: number) {
    return prisma.product.delete({
      where: { id },
    });
  }
}
