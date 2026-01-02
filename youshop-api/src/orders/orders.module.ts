import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { RedisModule } from '../products/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
