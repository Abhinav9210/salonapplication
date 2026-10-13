import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Booking } from '../../types'
import { bookingApi } from '../../api/bookingApi'
import toast from 'react-hot-toast'

type ApiError = {
  response?: {
    data?: { message?: string }
  }
}

interface BookingState {
  myBookings: Booking[]
  salonBookings: Booking[]
  barberBookings: Booking[]
  currentBooking: Booking | null
  totalPages: number
  loading: boolean
}

const initialState: BookingState = {
  myBookings: [],
  salonBookings: [],
  barberBookings: [],
  currentBooking: null,
  totalPages: 0,
  loading: false,
}

export const createBooking = createAsyncThunk(
  'booking/create',
  async (data: Record<string, unknown>, thunkAPI) => {
    try {
      const res = await bookingApi.create(data)
      toast.success('Booking submitted! Awaiting approval.')
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      toast.error(error.response?.data?.message || 'Booking failed')
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchMyBookings = createAsyncThunk(
  'booking/fetchMy',
  async (params: { page?: number; size?: number } = {}, thunkAPI) => {
    try {
      const res = await bookingApi.getMyBookings(params.page ?? 0, params.size ?? 10)
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchSalonBookings = createAsyncThunk(
  'booking/fetchSalon',
  async (params: { salonId: number; page?: number }, thunkAPI) => {
    try {
      const res = await bookingApi.getSalonBookings(params.salonId, params.page ?? 0)
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const fetchBarberBookings = createAsyncThunk(
  'booking/fetchBarber',
  async (params: { barberId: number; page?: number }, thunkAPI) => {
    try {
      const res = await bookingApi.getBarberBookings(params.barberId, params.page ?? 0)
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const approveBooking = createAsyncThunk('booking/approve', async (id: number, thunkAPI) => {
  try {
    const res = await bookingApi.approve(id)
    toast.success('Booking approved!')
    return res.data.data
  } catch (err) {
    const error = err as ApiError
    toast.error(error.response?.data?.message || 'Failed to approve')
    return thunkAPI.rejectWithValue(error.response?.data?.message)
  }
})

export const rejectBooking = createAsyncThunk(
  'booking/reject',
  async (params: { id: number; reason?: string }, thunkAPI) => {
    try {
      const res = await bookingApi.reject(params.id, params.reason)
      toast.success('Booking rejected')
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      toast.error(error.response?.data?.message || 'Failed to reject')
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const cancelBooking = createAsyncThunk(
  'booking/cancel',
  async (params: { id: number; reason?: string }, thunkAPI) => {
    try {
      const res = await bookingApi.cancel(params.id, params.reason)
      toast.success('Booking cancelled')
      return res.data.data
    } catch (err) {
      const error = err as ApiError
      toast.error(error.response?.data?.message || 'Failed to cancel')
      return thunkAPI.rejectWithValue(error.response?.data?.message)
    }
  }
)

export const completeBooking = createAsyncThunk('booking/complete', async (id: number, thunkAPI) => {
  try {
    const res = await bookingApi.complete(id)
    toast.success('Booking marked as completed!')
    return res.data.data
  } catch (err) {
    const error = err as ApiError
    toast.error(error.response?.data?.message || 'Failed to complete')
    return thunkAPI.rejectWithValue(error.response?.data?.message)
  }
})

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setCurrentBooking(state, action) { state.currentBooking = action.payload },
    updateBookingInList(state, action) {
      const updated = action.payload as Booking
      const update = (list: Booking[]) => {
        const idx = list.findIndex(b => b.id === updated.id)
        if (idx !== -1) list[idx] = updated
      }
      update(state.myBookings)
      update(state.salonBookings)
      update(state.barberBookings)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => { state.loading = true })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false
        state.myBookings = action.payload.content
        state.totalPages = action.payload.totalPages
      })
      .addCase(fetchMyBookings.rejected, (state) => { state.loading = false })
      .addCase(fetchSalonBookings.fulfilled, (state, action) => {
        const payload = action.payload
        state.salonBookings = Array.isArray(payload) ? payload : (payload?.content ?? [])
        state.totalPages = payload?.totalPages ?? 0
      })
      .addCase(fetchBarberBookings.fulfilled, (state, action) => {
        const payload = action.payload
        state.barberBookings = Array.isArray(payload) ? payload : (payload?.content ?? [])
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.myBookings.unshift(action.payload)
        state.currentBooking = action.payload
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
        const updated = action.payload
        const updateList = (list: Booking[]) => { const i = list.findIndex(b => b.id === updated.id); if (i !== -1) list[i] = updated }
        updateList(state.salonBookings); updateList(state.barberBookings); updateList(state.myBookings)
      })
      .addCase(rejectBooking.fulfilled, (state, action) => {
        const updated = action.payload
        const updateList = (list: Booking[]) => { const i = list.findIndex(b => b.id === updated.id); if (i !== -1) list[i] = updated }
        updateList(state.salonBookings); updateList(state.barberBookings); updateList(state.myBookings)
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const updated = action.payload
        const updateList = (list: Booking[]) => { const i = list.findIndex(b => b.id === updated.id); if (i !== -1) list[i] = updated }
        updateList(state.myBookings); updateList(state.salonBookings); updateList(state.barberBookings)
      })
      .addCase(completeBooking.fulfilled, (state, action) => {
        const updated = action.payload
        const updateList = (list: Booking[]) => { const i = list.findIndex(b => b.id === updated.id); if (i !== -1) list[i] = updated }
        updateList(state.salonBookings); updateList(state.barberBookings); updateList(state.myBookings)
      })
  },
})

export const { setCurrentBooking, updateBookingInList } = bookingSlice.actions
export default bookingSlice.reducer
