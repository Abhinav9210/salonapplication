import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, CheckCircle, XCircle, DollarSign, BarChart2, Plus, TrendingUp, Store } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchMySalons } from '../../features/salon/salonSlice'
import { fetchSalonBookings, approveBooking, rejectBooking, completeBooking } from '../../features/booking/bookingSlice'
import { ownerApi } from '../../api/index'
import type { DashboardAnalytics } from '../../types'
import StatCard from '../../components/common/StatCard'
import BookingStatusBadge from '../../components/common/BookingStatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Sidebar from '../../components/layout/Sidebar'
import Navbar from '../../components/layout/Navbar'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const OwnerDashboard = () => {
  const dispatch = useAppDispatch()
  const { mySalons } = useAppSelector(s => s.salon)
  const { salonBookings, loading } = useAppSelector(s => s.booking)
  const { sidebarOpen } = useAppSelector(s => s.ui)
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null)

  useEffect(() => { dispatch(fetchMySalons()) }, [])

  useEffect(() => {
    if (mySalons.length > 0 && !selectedSalonId) setSelectedSalonId(mySalons[0].id)
  }, [mySalons])

  useEffect(() => {
    if (selectedSalonId) {
      dispatch(fetchSalonBookings({ salonId: selectedSalonId }))
      ownerApi.getAnalytics(selectedSalonId).then(r => setAnalytics(r.data.data)).catch(() => {})
    }
  }, [selectedSalonId])

  const chartData = [
    { day: 'Mon', bookings: 4 }, { day: 'Tue', bookings: 7 }, { day: 'Wed', bookings: 5 },
    { day: 'Thu', bookings: 9 }, { day: 'Fri', bookings: 12 }, { day: 'Sat', bookings: 18 }, { day: 'Sun', bookings: 14 },
  ]

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Owner Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your salons and bookings</p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
              {mySalons.length > 1 && (
                <select value={selectedSalonId || ''} onChange={e => setSelectedSalonId(Number(e.target.value))}
                  className="input-field py-2.5 text-sm flex-1 sm:flex-initial min-h-[44px]">
                  {mySalons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              <Link to="/dashboard/owner/salons" className="btn-primary text-sm py-2.5 px-4 flex items-center justify-center gap-2 min-h-[44px] flex-1 sm:flex-initial">
                <Plus size={16} /> New Salon
              </Link>
            </div>
          </div>

          {mySalons.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
              <Store size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-white font-semibold text-lg mb-2">No Salons Yet</p>
              <p className="text-slate-500 text-sm mb-6">Create your salon to start accepting bookings</p>
              <Link to="/dashboard/owner/salons" className="btn-primary px-6 py-2.5 min-h-[44px] inline-flex items-center justify-center">Create Salon</Link>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                <StatCard label="Total Bookings" value={analytics?.totalBookings ?? '—'} icon={<Calendar size={18} />} color="violet" />
                <StatCard label="Total Earnings" value={analytics ? `₹${Math.round(analytics.totalEarnings).toLocaleString()}` : '—'} icon={<DollarSign size={18} />} color="green" />
                <StatCard label="This Week" value={analytics ? `₹${Math.round(analytics.weeklyEarnings ?? 0).toLocaleString()}` : '—'} icon={<TrendingUp size={18} />} color="teal" />
                <StatCard label="Avg Rating" value={analytics ? `${(analytics.averageRating ?? 0).toFixed(1)} ⭐` : '—'} icon={<BarChart2 size={18} />} color="yellow" />
              </div>

              {/* Chart */}
              <div className="glass-card p-4 sm:p-6 rounded-2xl mb-8">
                <h3 className="text-white font-semibold mb-4">Weekly Bookings</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', color: '#e2e8f0' }} />
                    <Area type="monotone" dataKey="bookings" stroke="#7c3aed" fill="url(#grad1)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bookings Section */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5">
                  <h3 className="text-white font-semibold text-sm sm:text-base">Recent Bookings</h3>
                  <Link to="/dashboard/owner/bookings" className="text-xs text-primary-400 hover:text-primary-300 font-medium">View all →</Link>
                </div>
                {loading ? <div className="p-8"><LoadingSpinner /></div> : (
                  <>
                    {/* Mobile Cards (< md) */}
                    <div className="md:hidden divide-y divide-white/5">
                      {salonBookings.slice(0, 8).map(b => (
                        <div key={b.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs text-primary-400 font-mono font-medium">{b.bookingReference}</span>
                              <h4 className="text-sm font-semibold text-white mt-0.5">{b.customerName}</h4>
                              <p className="text-xs text-slate-400">{b.serviceName}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <BookingStatusBadge status={b.status} />
                              <p className="text-sm font-bold text-white mt-1">₹{b.totalAmount}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-white/5">
                            <span>📅 {b.bookingDate} {b.startTime}</span>
                            <div className="flex items-center gap-2">
                              {b.status === 'PENDING' && (
                                <>
                                  <button onClick={() => dispatch(approveBooking(b.id))}
                                    className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 flex items-center gap-1" title="Approve">
                                    <CheckCircle size={14} /> Approve
                                  </button>
                                  <button onClick={() => dispatch(rejectBooking({ id: b.id, reason: 'Rejected by owner' }))}
                                    className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 flex items-center gap-1" title="Reject">
                                    <XCircle size={14} /> Reject
                                  </button>
                                </>
                              )}
                              {b.status === 'APPROVED' && (
                                <button onClick={() => dispatch(completeBooking(b.id))}
                                  className="min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium text-blue-400 border border-blue-500/30 hover:bg-blue-500/10">
                                  Mark Done ✓
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {salonBookings.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">No bookings yet</div>
                      )}
                    </div>

                    {/* Desktop Table (>= md) */}
                    <div className="hidden md:block overflow-x-auto touch-scroll">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/5">
                            {['Reference', 'Customer', 'Service', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {salonBookings.slice(0, 8).map(b => (
                            <tr key={b.id} className="hover:bg-white/2 transition-colors">
                              <td className="px-4 py-3 text-xs text-primary-400 font-mono">{b.bookingReference}</td>
                              <td className="px-4 py-3 text-sm text-white">{b.customerName}</td>
                              <td className="px-4 py-3 text-sm text-slate-400">{b.serviceName}</td>
                              <td className="px-4 py-3 text-xs text-slate-400">{b.bookingDate} {b.startTime}</td>
                              <td className="px-4 py-3 text-sm text-white font-medium">₹{b.totalAmount}</td>
                              <td className="px-4 py-3"><BookingStatusBadge status={b.status} /></td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1.5">
                                  {b.status === 'PENDING' && (
                                    <>
                                      <button onClick={() => dispatch(approveBooking(b.id))}
                                        className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 min-w-[32px] min-h-[32px] flex items-center justify-center" title="Approve">
                                        <CheckCircle size={16} />
                                      </button>
                                      <button onClick={() => dispatch(rejectBooking({ id: b.id, reason: 'Rejected by owner' }))}
                                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 min-w-[32px] min-h-[32px] flex items-center justify-center" title="Reject">
                                        <XCircle size={16} />
                                      </button>
                                    </>
                                  )}
                                  {b.status === 'APPROVED' && (
                                    <button onClick={() => dispatch(completeBooking(b.id))}
                                      className="px-2.5 py-1 rounded text-xs text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 min-h-[32px] font-medium">
                                      Mark Done
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                          {salonBookings.length === 0 && (
                            <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500 text-sm">No bookings yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default OwnerDashboard
