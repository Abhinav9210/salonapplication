import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import {
  fetchSalonBookings, approveBooking, rejectBooking,
  completeBooking, cancelBooking
} from '../../features/booking/bookingSlice'
import { fetchMySalons } from '../../features/salon/salonSlice'
import BookingStatusBadge from '../../components/common/BookingStatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { Calendar, CheckCircle, XCircle, Search } from 'lucide-react'
import type { BookingStatus } from '../../types'

const STATUS_FILTERS: { label: string; value: BookingStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
  { label: 'Rejected', value: 'REJECTED' },
]

const OwnerBookingsPage = () => {
  const dispatch = useAppDispatch()
  const { mySalons } = useAppSelector(s => s.salon)
  const { salonBookings, loading } = useAppSelector(s => s.booking)
  const { sidebarOpen } = useAppSelector(s => s.ui)
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => { dispatch(fetchMySalons()) }, [])

  useEffect(() => {
    if (mySalons.length > 0 && !selectedSalonId) {
      setSelectedSalonId(mySalons[0].id)
    }
  }, [mySalons])

  useEffect(() => {
    if (selectedSalonId) dispatch(fetchSalonBookings({ salonId: selectedSalonId }))
  }, [selectedSalonId])

  const filtered = salonBookings.filter(b => {
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter
    const matchSearch = !search || [b.customerName, b.barberName, b.serviceName, b.bookingReference]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
    return matchStatus && matchSearch
  })

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Bookings</h1>
              <p className="text-slate-400 text-sm mt-1">Manage all appointment requests</p>
            </div>
            {mySalons.length > 1 && (
              <select value={selectedSalonId || ''} onChange={e => setSelectedSalonId(Number(e.target.value))}
                className="input-field py-2 text-sm max-w-xs">
                {mySalons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by customer, barber, service..."
                className="input-field pl-10 py-2.5 text-sm" />
            </div>
            {/* Status filter tabs */}
            <div className="flex gap-1 p-1 rounded-xl overflow-x-auto"
              style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {STATUS_FILTERS.map(f => (
                <button key={f.value} onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    statusFilter === f.value
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}>
                  {f.label}
                  {f.value !== 'ALL' && (
                    <span className="ml-1 text-slate-600">
                      ({salonBookings.filter(b => b.status === f.value).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-10"><LoadingSpinner text="Loading bookings..." /></div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center">
                <Calendar size={48} className="mx-auto text-slate-700 mb-3" />
                <p className="text-white font-medium mb-1">No bookings found</p>
                <p className="text-slate-500 text-sm">
                  {statusFilter !== 'ALL' ? `No ${statusFilter.toLowerCase()} bookings` : 'No bookings yet'}
                </p>
              </div>
            ) : (
              <div>
                {/* Mobile Card View (< md) */}
                <div className="block md:hidden divide-y divide-white/5">
                  {filtered.map(b => (
                    <div key={b.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-white font-semibold">{b.customerName}</p>
                          <p className="text-xs text-slate-500">{b.customerEmail}</p>
                        </div>
                        <BookingStatusBadge status={b.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-xl bg-white/2 border border-white/5">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Service</span>
                          <span className="text-slate-300 font-medium">{b.serviceName}</span>
                          <span className="text-slate-500 block text-[10px]">{b.serviceDurationMinutes} mins · {b.barberName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Date & Time</span>
                          <span className="text-slate-300 font-medium">{b.bookingDate}</span>
                          <span className="text-slate-500 block text-[10px]">{b.startTime} – {b.endTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 gap-2 flex-wrap">
                        <div>
                          <span className="text-[10px] text-slate-500 font-mono block">{b.bookingReference}</span>
                          <p className="text-sm font-bold text-white">₹{b.totalAmount} <span className="text-[10px] font-normal text-slate-500">(Fee: ₹{b.bookingFee})</span></p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => dispatch(approveBooking(b.id))}
                                className="px-3 py-2 rounded-xl text-xs font-semibold text-green-400 bg-green-500/15 border border-green-500/30 min-h-[40px] flex items-center gap-1 active:scale-95"
                                title="Approve">
                                <CheckCircle size={15} /> Approve
                              </button>
                              <button
                                onClick={() => dispatch(rejectBooking({ id: b.id, reason: 'Rejected by owner' }))}
                                className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-500/15 border border-red-500/30 min-h-[40px] flex items-center gap-1 active:scale-95"
                                title="Reject">
                                <XCircle size={15} /> Reject
                              </button>
                            </>
                          )}
                          {b.status === 'APPROVED' && (
                            <button
                              onClick={() => dispatch(completeBooking(b.id))}
                              className="px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 bg-blue-500/15 border border-blue-500/30 min-h-[40px] whitespace-nowrap active:scale-95">
                              Mark Done
                            </button>
                          )}
                          {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                            <button
                              onClick={() => dispatch(cancelBooking({ id: b.id, reason: 'Cancelled by owner' }))}
                              className="px-2.5 py-2 rounded-xl text-xs text-gray-400 hover:text-red-400 border border-gray-500/20 min-h-[40px] active:scale-95">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View (>= md) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        {['Ref', 'Customer', 'Barber', 'Service', 'Date & Time', 'Amount', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3.5 text-left text-xs text-slate-500 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filtered.map(b => (
                        <tr key={b.id}
                          className="hover:bg-white/2 transition-colors group">
                          <td className="px-4 py-3 text-xs text-primary-400 font-mono">{b.bookingReference}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-white font-medium">{b.customerName}</p>
                            <p className="text-xs text-slate-500">{b.customerEmail}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-300">{b.barberName}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-slate-300">{b.serviceName}</p>
                            <p className="text-xs text-slate-500">{b.serviceDurationMinutes} mins</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-slate-300">{b.bookingDate}</p>
                            <p className="text-xs text-slate-500">{b.startTime} – {b.endTime}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-white font-semibold">₹{b.totalAmount}</p>
                            <p className="text-xs text-slate-500">Fee: ₹{b.bookingFee}</p>
                          </td>
                          <td className="px-4 py-3">
                            <BookingStatusBadge status={b.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {b.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => dispatch(approveBooking(b.id))}
                                    className="p-1.5 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                                    title="Approve">
                                    <CheckCircle size={16} />
                                  </button>
                                  <button
                                    onClick={() => dispatch(rejectBooking({ id: b.id, reason: 'Rejected by owner' }))}
                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                    title="Reject">
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}
                              {b.status === 'APPROVED' && (
                                <button
                                  onClick={() => dispatch(completeBooking(b.id))}
                                  className="px-2.5 py-1 rounded-lg text-xs text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-colors whitespace-nowrap">
                                  Mark Done
                                </button>
                              )}
                              {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                                <button
                                  onClick={() => dispatch(cancelBooking({ id: b.id, reason: 'Cancelled by owner' }))}
                                  className="px-2.5 py-1 rounded-lg text-xs text-gray-400 border border-gray-500/20 hover:bg-gray-500/10 transition-colors">
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-3 text-right">Showing {filtered.length} of {salonBookings.length} bookings</p>
        </div>
      </main>
    </div>
  )
}

export default OwnerBookingsPage
