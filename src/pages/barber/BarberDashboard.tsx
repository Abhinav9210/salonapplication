import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchBarberBookings, approveBooking, rejectBooking, completeBooking } from '../../features/booking/bookingSlice'
import BookingStatusBadge from '../../components/common/BookingStatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Sidebar from '../../components/layout/Sidebar'
import Navbar from '../../components/layout/Navbar'
import StatCard from '../../components/common/StatCard'
import { barberApi } from '../../api/index'
import { Calendar, Clock, CheckCircle, XCircle, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const BarberDashboard = () => {
  const dispatch = useAppDispatch()
  const { barberBookings, loading } = useAppSelector(s => s.booking)
  const { sidebarOpen } = useAppSelector(s => s.ui)
  const { user } = useAppSelector(s => s.auth)

  const [barberId, setBarberId] = useState<number | null>(null)
  const [barberName, setBarberName] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [profileError, setProfileError] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [togglingAvail, setTogglingAvail] = useState(false)
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED'>('ALL')

  // Step 1: resolve actual Barber entity from logged-in user
  useEffect(() => {
    setProfileLoading(true)
    barberApi.getMyProfile()
      .then(res => {
        const b = res.data.data
        setBarberId(b.id)
        setBarberName(b.name || user?.name || 'Barber')
        setIsAvailable(b.isAvailable ?? b.available ?? false)
        setProfileError(false)
        // Step 2: load bookings using real barber entity ID
        dispatch(fetchBarberBookings({ barberId: b.id }))
      })
      .catch(() => {
        setProfileError(true)
        // If no barber profile linked yet, just show empty state
      })
      .finally(() => setProfileLoading(false))
  }, [])

  const handleToggleAvailability = async () => {
    if (!barberId) return
    setTogglingAvail(true)
    try {
      await barberApi.toggleAvailability(barberId)
      setIsAvailable(v => !v)
      toast.success(isAvailable ? 'Marked as unavailable' : 'Marked as available')
    } catch {
      toast.error('Failed to update availability')
    } finally {
      setTogglingAvail(false) }
  }

  const today = new Date().toISOString().slice(0, 10)

  const filtered = barberBookings.filter(b => {
    if (activeTab === 'ALL') return true
    return b.status === activeTab
  })

  const pendingCount   = barberBookings.filter(b => b.status === 'PENDING').length
  const todayCount     = barberBookings.filter(b => b.bookingDate === today).length
  const completedCount = barberBookings.filter(b => b.status === 'COMPLETED').length

  if (profileLoading) return (
    <div className="min-h-screen bg-dark-900">
      <Navbar /><Sidebar />
      <main className={`pt-16 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <LoadingSpinner fullPage text="Loading your barber profile..." />
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Barber Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Welcome, {barberName || user?.name}</p>
            </div>
            {barberId && (
              <button
                onClick={handleToggleAvailability}
                disabled={togglingAvail}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  isAvailable
                    ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                    : 'bg-gray-500/10 text-gray-400 border-gray-500/30 hover:bg-gray-500/20'
                }`}>
                {isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {togglingAvail ? 'Updating...' : (isAvailable ? 'Available' : 'Unavailable')}
              </button>
            )}
          </div>

          {/* Profile not linked warning */}
          {profileError && (
            <div className="glass-card rounded-2xl p-5 mb-6 border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-300 font-medium text-sm">Barber profile not linked</p>
                <p className="text-yellow-500/80 text-xs mt-1">
                  Your user account needs to be linked to a barber profile by the salon owner. 
                  Ask your owner to add you as a barber in their salon.
                </p>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="Pending"   value={pendingCount}   icon={<Calendar size={18} />}   color="yellow" />
            <StatCard label="Today"     value={todayCount}     icon={<Clock size={18} />}       color="violet" />
            <StatCard label="Completed" value={completedCount} icon={<CheckCircle size={18} />} color="green"  />
          </div>

          {/* Bookings */}
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/5 px-4 pt-4 gap-1 overflow-x-auto">
              {(['ALL', 'PENDING', 'APPROVED', 'COMPLETED'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-primary-600/20 text-primary-300 border-b-2 border-primary-500'
                      : 'text-slate-400 hover:text-white'
                  }`}>
                  {tab}
                  <span className="ml-1.5 text-slate-600">
                    ({tab === 'ALL' ? barberBookings.length : barberBookings.filter(b => b.status === tab).length})
                  </span>
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-10"><LoadingSpinner /></div>
            ) : !barberId && !profileError ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <Calendar size={48} className="mx-auto text-slate-700 mb-3" />
                <p className="text-white font-medium mb-1">No {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} bookings</p>
                <p className="text-slate-500 text-sm mt-1">Appointments assigned to you will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filtered.map(b => (
                  <div key={b.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-medium text-sm">{b.customerName}</p>
                        <BookingStatusBadge status={b.status} />
                        <span className="text-xs text-primary-400 font-mono">{b.bookingReference}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        ✂️ {b.serviceName} &nbsp;·&nbsp; {b.serviceDurationMinutes} mins
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        📅 {b.bookingDate} &nbsp;🕐 {b.startTime} – {b.endTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-white font-semibold text-sm">₹{b.totalAmount}</span>
                      {b.status === 'PENDING' && (
                        <div className="flex gap-1.5">
                          <button onClick={() => dispatch(approveBooking(b.id))} title="Approve"
                            className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 border border-green-500/20 transition-colors">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => dispatch(rejectBooking({ id: b.id, reason: 'Rejected by barber' }))} title="Reject"
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors">
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                      {b.status === 'APPROVED' && (
                        <button onClick={() => dispatch(completeBooking(b.id))}
                          className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                          Mark Done ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default BarberDashboard
