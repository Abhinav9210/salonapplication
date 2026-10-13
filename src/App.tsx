import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute'
import { useWebSocket } from './hooks/useWebSocket'
import LoadingSpinner from './components/common/LoadingSpinner'

// Public / Customer
const HomePage          = lazy(() => import('./pages/customer/HomePage'))
const LoginPage         = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage      = lazy(() => import('./pages/auth/RegisterPage'))
const SalonsListPage    = lazy(() => import('./pages/customer/SalonsListPage'))
const SalonDetailPage   = lazy(() => import('./pages/customer/SalonDetailPage'))
const BookingPage       = lazy(() => import('./pages/customer/BookingPage'))
const CustomerOverview  = lazy(() => import('./pages/customer/CustomerOverview'))
const CustomerBookings  = lazy(() => import('./pages/customer/CustomerBookingsPage'))

// Owner
const OwnerDashboard    = lazy(() => import('./pages/owner/OwnerDashboard'))
const OwnerSalonsPage   = lazy(() => import('./pages/owner/OwnerSalonsPage'))
const OwnerBookingsPage = lazy(() => import('./pages/owner/OwnerBookingsPage'))
const OwnerBarbersPage  = lazy(() => import('./pages/owner/OwnerBarbersPage'))
const OwnerServicesPage = lazy(() => import('./pages/owner/OwnerServicesPage'))
const OwnerSlotsPage    = lazy(() => import('./pages/owner/OwnerSlotsPage'))

// Barber / Admin
const BarberDashboard   = lazy(() => import('./pages/barber/BarberDashboard'))
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
)

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <h1 className="text-5xl font-display font-bold text-gradient mb-3">403</h1>
      <p className="text-slate-400 mb-6">You don't have permission to access this page.</p>
      <a href="/" className="btn-primary px-6 py-2.5 text-sm">Go Home</a>
    </div>
  </div>
)

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <h1 className="text-6xl font-display font-bold text-gradient mb-3">404</h1>
      <p className="text-slate-400 mb-6">Page not found.</p>
      <a href="/" className="btn-primary px-6 py-2.5 text-sm">Go Home</a>
    </div>
  </div>
)

const OWNER: Array<'CUSTOMER' | 'OWNER' | 'BARBER' | 'ADMIN' | 'SUPERADMIN'> = ['OWNER', 'ADMIN', 'SUPERADMIN']

function App() {
  useWebSocket()

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/"             element={<HomePage />} />
        <Route path="/salons"       element={<SalonsListPage />} />
        <Route path="/salons/:id"   element={<SalonDetailPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Auth-only public */}
        <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Customer (OWNER, ADMIN, SUPERADMIN can also book) */}
        <Route path="/dashboard/customer"          element={<ProtectedRoute roles={['CUSTOMER', 'OWNER', 'ADMIN', 'SUPERADMIN']}><CustomerOverview /></ProtectedRoute>} />
        <Route path="/dashboard/customer/bookings" element={<ProtectedRoute roles={['CUSTOMER', 'OWNER', 'ADMIN', 'SUPERADMIN']}><CustomerBookings /></ProtectedRoute>} />
        <Route path="/salons/:id/book"             element={<ProtectedRoute roles={['CUSTOMER', 'OWNER', 'ADMIN', 'SUPERADMIN']}><BookingPage /></ProtectedRoute>} />

        {/* Owner — each sidebar link has its own page */}
        <Route path="/dashboard/owner"             element={<ProtectedRoute roles={OWNER}><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/owner/salons"      element={<ProtectedRoute roles={OWNER}><OwnerSalonsPage /></ProtectedRoute>} />
        <Route path="/dashboard/owner/bookings"    element={<ProtectedRoute roles={OWNER}><OwnerBookingsPage /></ProtectedRoute>} />
        <Route path="/dashboard/owner/barbers"     element={<ProtectedRoute roles={OWNER}><OwnerBarbersPage /></ProtectedRoute>} />
        <Route path="/dashboard/owner/services"    element={<ProtectedRoute roles={OWNER}><OwnerServicesPage /></ProtectedRoute>} />
        <Route path="/dashboard/owner/slots"       element={<ProtectedRoute roles={OWNER}><OwnerSlotsPage /></ProtectedRoute>} />
        {/* Catch-all for owner sub-routes */}
        <Route path="/dashboard/owner/*"           element={<ProtectedRoute roles={OWNER}><OwnerDashboard /></ProtectedRoute>} />

        {/* Barber */}
        <Route path="/dashboard/barber"   element={<ProtectedRoute roles={['BARBER', 'OWNER', 'ADMIN', 'SUPERADMIN']}><BarberDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/barber/*" element={<ProtectedRoute roles={['BARBER', 'OWNER', 'ADMIN', 'SUPERADMIN']}><BarberDashboard /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/dashboard/admin"   element={<ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin/*" element={<ProtectedRoute roles={['ADMIN', 'SUPERADMIN']}><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
