import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RedisModule } from './redis.module';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [RedisModule, MinioModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
