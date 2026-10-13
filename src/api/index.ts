import api from './axios'

type Payload = Record<string, unknown>

export const barberApi = {
  getMyProfile: () => api.get('/barbers/my-profile'),
  add: (data: Payload) => api.post('/barbers', data),
  update: (id: number, data: Payload) => api.put(`/barbers/${id}`, data),
  getById: (id: number) => api.get(`/barbers/${id}`),
  toggleAvailability: (id: number) => api.patch(`/barbers/${id}/toggle-availability`),
  delete: (id: number) => api.delete(`/barbers/${id}`),
}

export const slotApi = {
  generate: (data: Payload) => api.post('/slots/generate', data),
  getAvailable: (barberId: number, date: string) =>
    api.get(`/slots/available?barberId=${barberId}&date=${date}`),
  getAll: (barberId: number, date: string) =>
    api.get(`/slots?barberId=${barberId}&date=${date}`),
  delete: (id: number) => api.delete(`/slots/${id}`),
}

export const serviceApi = {
  add: (salonId: number, data: Payload) => api.post(`/owner/salons/${salonId}/services`, data),
  update: (id: number, data: Payload) => api.put(`/owner/services/${id}`, data),
  delete: (id: number) => api.delete(`/owner/services/${id}`),
}

export const paymentApi = {
  process: (data: Payload) => api.post('/payments/process', data),
  getByBooking: (bookingId: number) => api.get(`/payments/booking/${bookingId}`),
}

export const reviewApi = {
  create: (data: Payload) => api.post('/reviews', data),
  getSalonReviews: (salonId: number, page = 0) => api.get(`/reviews/salon/${salonId}?page=${page}`),
  getBarberReviews: (barberId: number, page = 0) => api.get(`/reviews/barber/${barberId}?page=${page}`),
}

export const ownerApi = {
  getAnalytics: (salonId: number) => api.get(`/owner/analytics/${salonId}`),
}

export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
  getPendingSalons: (page = 0) => api.get(`/admin/salons/pending?page=${page}`),
  getAllSalons: (page = 0) => api.get(`/admin/salons?page=${page}`),
  approveSalon: (id: number) => api.patch(`/admin/salons/${id}/approve`),
  rejectSalon: (id: number) => api.patch(`/admin/salons/${id}/reject`),
  getAllUsers: (page = 0) => api.get(`/admin/users?page=${page}`),
  toggleUserStatus: (id: number) => api.patch(`/admin/users/${id}/toggle-status`),
  deleteSalon: (id: number) => api.delete(`/admin/salons/${id}`),
}
