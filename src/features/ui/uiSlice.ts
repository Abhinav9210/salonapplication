import { createSlice } from '@reduxjs/toolkit'

interface UiState {
  sidebarOpen: boolean
  bookingStep: number
  selectedSalonId: number | null
  selectedBarberId: number | null
  selectedServiceId: number | null
  selectedSlotId: number | null
}

const initialState: UiState = {
  sidebarOpen: true,
  bookingStep: 0,
  selectedSalonId: null,
  selectedBarberId: null,
  selectedServiceId: null,
  selectedSlotId: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen(state, action) { state.sidebarOpen = action.payload },
    setBookingStep(state, action) { state.bookingStep = action.payload },
    nextBookingStep(state) { state.bookingStep += 1 },
    prevBookingStep(state) { state.bookingStep -= 1 },
    resetBookingFlow(state) {
      state.bookingStep = 0
      state.selectedBarberId = null
      state.selectedServiceId = null
      state.selectedSlotId = null
    },
    setSelectedBarber(state, action) { state.selectedBarberId = action.payload },
    setSelectedService(state, action) { state.selectedServiceId = action.payload },
    setSelectedSlot(state, action) { state.selectedSlotId = action.payload },
    setSelectedSalon(state, action) { state.selectedSalonId = action.payload },
  },
})

export const {
  toggleSidebar, setSidebarOpen,
  setBookingStep, nextBookingStep, prevBookingStep, resetBookingFlow,
  setSelectedBarber, setSelectedService, setSelectedSlot, setSelectedSalon,
} = uiSlice.actions
export default uiSlice.reducer
