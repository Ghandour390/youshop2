import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { RedisModule } from '../products/redis.module';
import { ResourceOwnerGuard } from '../auth/resource-owner.guard';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [RedisModule],
  controllers: [OrdersController],
  providers: [OrdersService, ResourceOwnerGuard, PrismaService],
})
export class OrdersModule {}
