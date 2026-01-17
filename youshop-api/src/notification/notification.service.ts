import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    return await this.prisma.notification.create({
      data: {
        ...createNotificationDto,
      },
    });
  }

  async findAll() {
    return await this.prisma.notification.findMany();
  }

  async findOne(id: number) {
    return await this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return await this.prisma.notification.update({
      where: { id },
      data: {
        ...updateNotificationDto,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.notification.delete({
      where: { id },
    });
  }
  async findByNotifiableId(notifiableId: number) {
    return await this.prisma.notification.findMany({
      where: { notifiableId },
    });
  }
  async markAsRead(id: number) {
    return await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
  async markAllAsRead(notifiableId: number) {
    return await this.prisma.notification.updateMany({
      where: { notifiableId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async deleteAll(notifiableId: number) {
    return await this.prisma.notification.deleteMany({
      where: { notifiableId },
    });
  }

}