import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Scissors, ArrowRight, Clock, CheckCircle, XCircle, Star } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchMyBookings } from '../../features/booking/bookingSlice'
import BookingStatusBadge from '../../components/common/BookingStatusBadge'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'

const CustomerOverview = () => {
  const dispatch = useAppDispatch()
  const { user }                     = useAppSelector(s => s.auth)
  const { sidebarOpen }              = useAppSelector(s => s.ui)
  const { myBookings, loading }      = useAppSelector(s => s.booking)

  useEffect(() => {
    dispatch(fetchMyBookings({ page: 0, size: 20 }))
  }, [])

  const total     = myBookings.length
  const pending   = myBookings.filter(b => b.status === 'PENDING' || b.status === 'APPROVED').length
  const completed = myBookings.filter(b => b.status === 'COMPLETED').length
  const cancelled = myBookings.filter(b => b.status === 'CANCELLED' || b.status === 'EXPIRED').length
  const recent    = myBookings.slice(0, 5)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">

          {/* Welcome banner */}
          <div className="relative rounded-2xl p-6 mb-8 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.12))', border: '1px solid rgba(124,58,237,0.25)' }}>
            <div className="glow-orb w-48 h-48 bg-primary-600 -top-12 -right-12 opacity-30" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-glow"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{greeting()},</p>
                  <h1 className="text-2xl font-display font-bold text-white">{user?.name} 👋</h1>
                  <p className="text-slate-400 text-sm mt-0.5">Ready for your next grooming session?</p>
                </div>
              </div>
              <Link to="/salons" className="btn-primary px-6 py-2.5 text-sm flex-shrink-0 flex items-center gap-2">
                Book Appointment <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
            {[
              { label: 'Total Bookings',  value: total,     icon: <Calendar size={18} />,    color: 'rgba(124,58,237,0.15)', text: '#a78bfa', border: 'rgba(124,58,237,0.25)' },
              { label: 'Upcoming',        value: pending,   icon: <Clock size={18} />,       color: 'rgba(245,158,11,0.15)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
              { label: 'Completed',       value: completed, icon: <CheckCircle size={18} />, color: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
              { label: 'Cancelled',       value: cancelled, icon: <XCircle size={18} />,     color: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.2)'  },
            ].map(s => (
              <div key={s.label} className="glass-card p-5 rounded-2xl hover:border-white/15 transition-all duration-300 group animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{s.label}</p>
                    <p className="text-3xl font-display font-bold text-white mt-1">{s.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: s.color, border: `1px solid ${s.border}`, color: s.text }}>
                    {s.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent bookings */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-white/5">
                  <h2 className="text-white font-semibold flex items-center gap-2">
                    <Calendar size={16} className="text-primary-400" /> Recent Bookings
                  </h2>
                  <Link to="/dashboard/customer/bookings"
                    className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
                    View all <ArrowRight size={12} />
                  </Link>
                </div>

                {loading ? (
                  <div className="divide-y divide-white/5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 skeleton rounded-xl flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 skeleton w-1/2" />
                          <div className="h-2 skeleton w-3/4" />
                        </div>
                        <div className="h-5 skeleton w-16 rounded-full" />
                      </div>
                    ))}
                  </div>
                ) : recent.length === 0 ? (
                  <div className="p-12 text-center">
                    <Scissors size={40} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-white font-medium mb-1">No bookings yet</p>
                    <p className="text-slate-500 text-sm mb-5">Book your first appointment today!</p>
                    <Link to="/salons" className="btn-primary px-5 py-2 text-sm">Browse Salons</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {recent.map(b => (
                      <div key={b.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.2)' }}>
                          <Scissors size={18} className="text-primary-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{b.salonName}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{b.serviceName} · {b.bookingDate} at {b.startTime}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <BookingStatusBadge status={b.status} />
                          <p className="text-white text-sm font-semibold mt-1">₹{b.totalAmount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Star size={16} className="text-yellow-400" /> Quick Actions
                </h2>
                <div className="space-y-2">
                  {[
                    { to: '/salons',                           label: 'Browse Salons',     icon: <Scissors size={15} />,    desc: 'Find nearby salons' },
                    { to: '/dashboard/customer/bookings',      label: 'My Bookings',       icon: <Calendar size={15} />,    desc: 'Track your appointments' },
                  ].map(a => (
                    <Link key={a.to} to={a.to}
                      className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-primary-600/30 hover:bg-primary-600/5 transition-all group">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-400"
                        style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                        {a.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium group-hover:text-primary-300 transition-colors">{a.label}</p>
                        <p className="text-slate-500 text-xs">{a.desc}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-600 group-hover:text-primary-400 transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Account info card */}
              <div className="glass-card rounded-2xl p-5">
                <h2 className="text-white font-semibold mb-3 text-sm">Account</h2>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Name</span>
                    <span className="text-white font-medium truncate ml-4">{user?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Email</span>
                    <span className="text-slate-300 text-xs truncate ml-4">{user?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Role</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-400">{user?.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}

export default CustomerOverview
