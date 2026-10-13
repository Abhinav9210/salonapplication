// Auth types
export interface User {
  id: number
  name: string
  email: string
  phone?: string
  profilePicture?: string
  role: 'CUSTOMER' | 'OWNER' | 'BARBER' | 'ADMIN' | 'SUPERADMIN'
  isActive: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
}

// Salon types
export interface Salon {
  id: number
  ownerId: number
  ownerName: string
  name: string
  description?: string
  address: string
  city: string
  state?: string
  pincode?: string
  latitude?: number
  longitude?: number
  rating: number
  totalReviews: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  phone?: string
  openTime?: string
  closeTime?: string
  minimumBookingFee: number
  images: string[]
  workingDays: string[]
  createdAt: string
}

// Barber types
export interface Barber {
  id: number
  salonId: number
  salonName: string
  userId?: number
  name: string
  email?: string
  bio?: string
  experienceYears: number
  specializations: string[]
  rating: number
  totalReviews: number
  isAvailable: boolean
  profilePicture?: string
  createdAt: string
}

// Service types
export interface SalonService {
  id: number
  salonId: number
  salonName: string
  name: string
  description?: string
  durationMinutes: number
  price: number
  isActive: boolean
  createdAt: string
}

// Time slot types
export interface TimeSlot {
  id: number
  barberId: number
  barberName: string
  date: string
  startTime: string
  endTime: string
  isBooked: boolean
  isAvailable: boolean
}

// Booking types
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
export type PaymentMode = 'ONLINE_FULL' | 'ONLINE_FEE_CASH_REMAINING'

export interface Booking {
  id: number
  bookingReference: string
  customerId: number
  customerName: string
  customerEmail: string
  salonId: number
  salonName: string
  barberId: number
  barberName: string
  serviceId: number
  serviceName: string
  serviceDurationMinutes: number
  slotId: number
  bookingDate: string
  startTime: string
  endTime: string
  status: BookingStatus
  bookingFee: number
  totalAmount: number
  paymentMode: PaymentMode
  notes?: string
  cancellationReason?: string
  bookedAt: string
  approvedAt?: string
  completedAt?: string
  expiresAt?: string
}

// Payment types
export interface Payment {
  id: number
  bookingId: number
  bookingReference: string
  amount: number
  method: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  paidAt?: string
  createdAt: string
}

// Review types
export interface Review {
  id: number
  customerId: number
  customerName: string
  customerProfilePic?: string
  salonId?: number
  barberId?: number
  rating: number
  comment?: string
  createdAt: string
}

// Notification types
export interface Notification {
  id: number
  title: string
  message: string
  type: string
  isRead: boolean
  referenceId?: string
  createdAt: string
}

// Analytics
export interface DashboardAnalytics {
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  cancelledBookings: number
  totalEarnings: number
  weeklyEarnings: number
  dailyEarnings: number
  totalBarbers: number
  totalServices: number
  averageRating: number
}

// Pagination
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}
