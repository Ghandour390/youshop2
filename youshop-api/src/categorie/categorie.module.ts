import { Module } from '@nestjs/common';
import { CategorieController } from './categorie.controller';
import { CategorieService } from './categorie.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CategorieController],
  providers: [CategorieService, PrismaService],
  exports: [CategorieService],
})
export class CategorieModule {}
