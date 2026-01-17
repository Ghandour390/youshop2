export class Notification {
    
  id: number;
  notifiableId: number;
  type: string;
  data: any;
  readAt: Date | null;
  createdAt: Date;
}
