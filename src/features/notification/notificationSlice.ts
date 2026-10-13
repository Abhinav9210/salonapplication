import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { Notification } from '../../types'
import { notificationApi } from '../../api/notificationApi'

type ApiError = {
  response?: {
    data?: { message?: string }
  }
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
}

export const fetchNotifications = createAsyncThunk('notification/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await notificationApi.getAll()
    return res.data.data
  } catch (err) {
    const error = err as ApiError
    return thunkAPI.rejectWithValue(error.response?.data?.message)
  }
})

export const fetchUnreadCount = createAsyncThunk('notification/unreadCount', async (_, thunkAPI) => {
  try {
    const res = await notificationApi.getUnreadCount()
    return res.data.data
  } catch (err) {
    const error = err as ApiError
    return thunkAPI.rejectWithValue(error.response?.data?.message)
  }
})

export const markAllRead = createAsyncThunk('notification/markAllRead', async (_, thunkAPI) => {
  try {
    await notificationApi.markAllRead()
  } catch (err) {
    const error = err as ApiError
    return thunkAPI.rejectWithValue(error.response?.data?.message)
  }
})

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification(state, action) {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.notifications = state.notifications.map(n => ({ ...n, isRead: true }))
        state.unreadCount = 0
      })
  },
})

export const { addNotification } = notificationSlice.actions
export default notificationSlice.reducer
