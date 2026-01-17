import { Prisma } from '@prisma/client';

export class CreateNotificationDto {
    notifiableId: number;
    type: string;
    data: Prisma.InputJsonValue;
}
