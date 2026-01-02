import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategorieService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.categorie.findMany();
  }

    async create(name: string) {
    return this.prisma.categorie.create({
      data: {
        name,
      },
    });
  }

  async update(id: number, name: string) {
    return this.prisma.categorie.update({
      where: { id },
      data: { name },
    });
  }

 async findById(id: number) {
    return this.prisma.categorie.findUnique({
      where: { id },
    });
  }

  async delete(id: number) {
    return this.prisma.categorie.delete({
      where: { id },
    });
  }
}