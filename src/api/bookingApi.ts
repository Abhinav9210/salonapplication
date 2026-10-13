import api from './axios'

type BookingPayload = Record<string, unknown>

export const bookingApi = {
  create: (data: BookingPayload) => api.post('/bookings', data),
  getById: (id: number) => api.get(`/bookings/${id}`),
  getMyBookings: (page = 0, size = 10) => api.get(`/bookings/my-bookings?page=${page}&size=${size}`),
  getSalonBookings: (salonId: number, page = 0) =>
    api.get(`/bookings/salon/${salonId}?page=${page}`),
  getBarberBookings: (barberId: number, page = 0) =>
    api.get(`/bookings/barber/${barberId}?page=${page}`),
  approve: (id: number) => api.patch(`/bookings/${id}/approve`),
  reject: (id: number, reason?: string) =>
    api.patch(`/bookings/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`),
  complete: (id: number) => api.patch(`/bookings/${id}/complete`),
  cancel: (id: number, reason?: string) =>
    api.patch(`/bookings/${id}/cancel${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`),
}
