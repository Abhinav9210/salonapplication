import api from './axios'

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.patch('/notifications/mark-all-read'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read`),
}
