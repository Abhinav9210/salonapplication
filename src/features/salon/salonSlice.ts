import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Salon } from '../../types'
import { salonApi } from '../../api/salonApi'
import toast from 'react-hot-toast'

type ApiError = {
  response?: {
    data?: { message?: string }
  }
}

interface SalonState {
  salons: Salon[]
  currentSalon: Salon | null
  mySalons: Salon[]
  topRated: Salon[]
  searchResults: Salon[]
  totalPages: number
  loading: boolean
}

const initialState: SalonState = {
  salons: [],
  currentSalon: null,
  mySalons: [],
  topRated: [],
  searchResults: [],
  totalPages: 0,
  loading: false,
}

export const fetchApprovedSalons = createAsyncThunk(
  'salon/fetchApproved',
  async (params: { page?: number; size?: number } = {}, thunkAPI) => {
    try {
      const res = await salonApi.getApproved(params.page ?? 0, params.size ?? 12)
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const searchSalons = createAsyncThunk(
  'salon/search',
  async (params: { query: string; page?: number }, thunkAPI) => {
    try {
      const res = await salonApi.search(params.query, params.page ?? 0)
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchSalonById = createAsyncThunk(
  'salon/fetchById',
  async (id: number, thunkAPI) => {
    try {
      const res = await salonApi.getById(id)
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchMySalons = createAsyncThunk('salon/fetchMy', async (_, thunkAPI) => {
  try {
    const res = await salonApi.getMy()
    return res.data.data
  } catch (err) {
    const error = err as ApiError
    return thunkAPI.rejectWithValue(error.response?.data?.message)
  }
})

export const fetchTopRated = createAsyncThunk('salon/fetchTopRated', async (_, thunkAPI) => {
  try {
    const res = await salonApi.getTopRated()
    return res.data.data
  } catch (err) {
    const error = err as ApiError
    return thunkAPI.rejectWithValue(error.response?.data?.message)
  }
})

export const createSalon = createAsyncThunk(
  'salon/create',
  async (data: Record<string, unknown>, thunkAPI) => {
    try {
      const res = await salonApi.create(data)
      toast.success('Salon created! Awaiting admin approval.')
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      toast.error(error.response?.data?.message || 'Failed to create salon')
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

const salonSlice = createSlice({
  name: 'salon',
  initialState,
  reducers: {
    clearCurrentSalon(state) { state.currentSalon = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedSalons.pending, (state) => { state.loading = true })
      .addCase(fetchApprovedSalons.fulfilled, (state, action) => {
        state.loading = false
        const p = action.payload
        state.salons = Array.isArray(p) ? p : (p?.content ?? [])
        state.totalPages = p?.totalPages ?? 0
      })
      .addCase(fetchApprovedSalons.rejected, (state) => { state.loading = false })
      .addCase(searchSalons.pending, (state) => { state.loading = true })
      .addCase(searchSalons.fulfilled, (state, action) => {
        state.loading = false
        const p = action.payload
        state.searchResults = Array.isArray(p) ? p : (p?.content ?? [])
      })
      .addCase(searchSalons.rejected, (state) => { state.loading = false })
      .addCase(fetchSalonById.pending, (state) => { state.loading = true })
      .addCase(fetchSalonById.fulfilled, (state, action) => {
        state.loading = false
        state.currentSalon = action.payload
      })
      .addCase(fetchSalonById.rejected, (state) => { state.loading = false })
      .addCase(fetchMySalons.fulfilled, (state, action) => {
        const p = action.payload
        state.mySalons = Array.isArray(p) ? p : (p?.content ?? [])
      })
      .addCase(fetchTopRated.fulfilled, (state, action) => {
        const p = action.payload
        state.topRated = Array.isArray(p) ? p : (p?.content ?? [])
      })
      .addCase(createSalon.fulfilled, (state, action) => {
        state.mySalons.push(action.payload)
      })
  },
})

export const { clearCurrentSalon } = salonSlice.actions
export default salonSlice.reducer
