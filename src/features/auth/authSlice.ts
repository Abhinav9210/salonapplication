import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, User } from '../../types'
import { authApi } from '../../api/authApi'
import toast from 'react-hot-toast'

type ApiError = {
  response?: {
    data?: { message?: string }
  }
}

const token = localStorage.getItem('token')
const refreshToken = localStorage.getItem('refreshToken')
const userStr = localStorage.getItem('user')

const initialState: AuthState = {
  user: userStr ? JSON.parse(userStr) : null,
  token: token,
  refreshToken: refreshToken,
  isAuthenticated: !!token,
  loading: false,
}

export const register = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string; phone?: string; role?: string }, thunkAPI) => {
    try {
      const res = await authApi.register(data)
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (data: { email: string; password: string }, thunkAPI) => {
    try {
      const res = await authApi.login(data)
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    const res = await authApi.me()
    return res.data.data
  } catch (err) {
    const error = err as ApiError
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      toast.success('Logged out successfully')
    },
    setCredentials(state, action: PayloadAction<{ token: string; refreshToken: string; user: User }>) {
      state.token = action.payload.token
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => { state.loading = true })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.user = {
          id: action.payload.userId,
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
        localStorage.setItem('user', JSON.stringify(state.user))
        toast.success('Welcome to SalonEase! 🎉')
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        toast.error(action.payload as string)
      })
      .addCase(login.pending, (state) => { state.loading = true })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.accessToken
        state.refreshToken = action.payload.refreshToken
        state.user = {
          id: action.payload.userId,
          name: action.payload.name,
          email: action.payload.email,
          role: action.payload.role,
          isActive: true,
          createdAt: new Date().toISOString(),
        }
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.accessToken)
        localStorage.setItem('refreshToken', action.payload.refreshToken)
        localStorage.setItem('user', JSON.stringify(state.user))
        toast.success(`Welcome back, ${action.payload.name}! 👋`)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        toast.error(action.payload as string)
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
  },
})

export const { logout, setCredentials } = authSlice.actions
export default authSlice.reducer
