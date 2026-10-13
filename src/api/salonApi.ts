import api from './axios'

type SalonPayload = Record<string, unknown>

export const salonApi = {
  create: (data: SalonPayload) => api.post('/salons', data),
  update: (id: number, data: SalonPayload) => api.put(`/salons/${id}`, data),
  getById: (id: number) => api.get(`/salons/${id}`),
  getApproved: (page = 0, size = 12, sortBy = 'rating') =>
    api.get(`/salons/approved?page=${page}&size=${size}&sortBy=${sortBy}`),
  search: (query: string, page = 0) =>
    api.get(`/salons/search?query=${encodeURIComponent(query)}&page=${page}`),
  getTopRated: () => api.get('/salons/top-rated'),
  getMy: () => api.get('/salons/my-salons'),
  getBarbers: (id: number) => api.get(`/salons/${id}/barbers`),
  getServices: (id: number) => api.get(`/salons/${id}/services`),
  getReviews: (id: number, page = 0) => api.get(`/salons/${id}/reviews?page=${page}`),
}
