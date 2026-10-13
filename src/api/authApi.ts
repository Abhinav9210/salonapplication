import api from './axios'

type AuthPayload = Record<string, unknown>

export const authApi = {
  register: (data: AuthPayload) => api.post('/auth/register', data),
  login: (data: AuthPayload) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refresh: (token: string) => api.post(`/auth/refresh?refreshToken=${token}`),
}
