import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import salonReducer from '../features/salon/salonSlice'
import bookingReducer from '../features/booking/bookingSlice'
import notificationReducer from '../features/notification/notificationSlice'
import uiReducer from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    salon: salonReducer,
    booking: bookingReducer,
    notification: notificationReducer,
    ui: uiReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
