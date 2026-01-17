import { WebSocketGateway, SubscribeMessage, MessageBody, WsException } from '@nestjs/websockets';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@WebSocketGateway()
export class NotificationGateway {
  constructor(private readonly notificationService: NotificationService) {}

  @SubscribeMessage('createNotification')
  async create(@MessageBody() createNotificationDto: CreateNotificationDto) {
    try {
      return await this.notificationService.create(createNotificationDto);
    } catch (error) {
      throw new WsException((error as Error).message);
    }
  }

  @SubscribeMessage('findAllNotification')
  async findAll() {
    try {
      return await this.notificationService.findAll();
    } catch (error) {
      throw new WsException((error as Error).message);
    }
  }

  @SubscribeMessage('findOneNotification')
  async findOne(@MessageBody() data: { id: number }) {
    try {
      return await this.notificationService.findOne(data.id);
    } catch (error) {
      throw new WsException((error as Error).message);
    }
  }

  @SubscribeMessage('updateNotification')
  async update(@MessageBody() updateNotificationDto: UpdateNotificationDto) {
    try {
      return await this.notificationService.update(updateNotificationDto.id, updateNotificationDto);
    } catch (error) {
      throw new WsException((error as Error).message);
    }
  }

  @SubscribeMessage('removeNotification')
  async remove(@MessageBody() data: { id: number }) {
    try {
      return await this.notificationService.remove(data.id);
    } catch (error) {
      throw new WsException((error as Error).message);
    }
  }

  @SubscribeMessage('markAsReadNotification')
  async markAsRead(@MessageBody() data: { id: number }) {
    try {
      return await this.notificationService.markAsRead(data.id);
    } catch (error) {
      throw new WsException((error as Error).message);
    }
  }

  @SubscribeMessage('markAllAsReadNotification')
  async markAllAsRead(@MessageBody() data: { notifiableId: number }) {
    try {
      return await this.notificationService.markAllAsRead(data.notifiableId);
    } catch (error) {
      throw new WsException((error as Error).message);
    }
  }

  @SubscribeMessage('deleteAllNotification')
  async deleteAll(@MessageBody() data: { notifiableId: number }) {
    try {
      return await this.notificationService.deleteAll(data.notifiableId);
    } catch (error) {
      throw new WsException((error as Error).message);
    }
  }
}
