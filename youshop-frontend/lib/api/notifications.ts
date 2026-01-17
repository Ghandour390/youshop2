import axiosInstance from '@/lib/axios';

export interface Notification {
  id: number;
  message: string;
  type: 'order' | 'product' | 'system';
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.patch('/notifications/read-all');
    return response.data;
  },
};
