import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { RedisModule } from '../products/redis.module';
import { ResourceOwnerGuard } from '../auth/resource-owner.guard';
import { StripeModule } from 'src/stripe/stripe.module';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [RedisModule, StripeModule],
  controllers: [OrdersController],
  providers: [OrdersService, ResourceOwnerGuard, NotificationService],
})
export class OrdersModule {}
