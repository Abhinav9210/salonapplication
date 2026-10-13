import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Scissors, X, AlertTriangle, Star, MessageSquare } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchMyBookings, cancelBooking } from '../../features/booking/bookingSlice'
import { reviewApi } from '../../api/index'
import BookingStatusBadge from '../../components/common/BookingStatusBadge'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Sidebar from '../../components/layout/Sidebar'
import Navbar from '../../components/layout/Navbar'
import type { Booking } from '../../types'
import toast from 'react-hot-toast'

// ── Cancel confirmation modal ──────────────────────────────────────────────────
const CancelModal = ({
  booking, onConfirm, onClose
}: { booking: Booking; onConfirm: () => void; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
    <div className="glass-card rounded-2xl p-6 max-w-sm w-full shadow-card animate-scale-in">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle size={18} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Cancel Booking?</h3>
          <p className="text-slate-400 text-sm mt-1">
            This will cancel your appointment at <strong className="text-white">{booking.salonName}</strong> for{' '}
            <strong className="text-white">{booking.serviceName}</strong> on{' '}
            <strong className="text-white">{booking.bookingDate}</strong>. This cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Keep It</button>
        <button onClick={onConfirm} className="btn-danger flex-1 py-2.5 text-sm border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20">
          Yes, Cancel
        </button>
      </div>
    </div>
  </div>
)

// ── Leave review modal ─────────────────────────────────────────────────────────
const ReviewModal = ({
  booking, onClose
}: { booking: Booking; onClose: () => void }) => {
  const [rating,  setRating]  = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!rating) { toast.error('Please select a rating'); return }
    setLoading(true)
    try {
      await reviewApi.create({ salonId: booking.salonId, barberId: booking.barberId, rating, comment })
      toast.success('Review submitted! ⭐ Thank you!')
      onClose()
    } catch {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl p-6 max-w-sm w-full shadow-card animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">Leave a Review</h3>
            <p className="text-slate-500 text-xs mt-0.5">{booking.salonName} · {booking.serviceName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Star rating selector */}
        <div className="flex justify-center gap-2 mb-5">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(s)}
              className="transition-transform hover:scale-125"
            >
              <Star
                size={32}
                className={`transition-colors ${s <= (hovered || rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          rows={3}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience (optional)…"
          className="input-field resize-none mb-4 text-sm"
        />

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Skip</button>
          <button onClick={submit} disabled={loading || !rating} className="btn-primary flex-1 py-2.5 text-sm">
            {loading ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
const CustomerBookingsPage = () => {
  const dispatch = useAppDispatch()
  const { myBookings, loading } = useAppSelector(s => s.booking)
  const { sidebarOpen }         = useAppSelector(s => s.ui)
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null)
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null)
  const [filter,       setFilter]       = useState<'ALL' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED'>('ALL')

  useEffect(() => { dispatch(fetchMyBookings({ page: 0, size: 20 })) }, [])

  const handleConfirmCancel = () => {
    if (!cancelTarget) return
    dispatch(cancelBooking({ id: cancelTarget.id, reason: 'Cancelled by customer' }))
    setCancelTarget(null)
  }

  const filtered = myBookings.filter(b =>
    filter === 'ALL' ? true :
    filter === 'CANCELLED' ? (b.status === 'CANCELLED' || b.status === 'EXPIRED') :
    b.status === filter
  )

  const tabs: Array<{ key: typeof filter; label: string; count: number }> = [
    { key: 'ALL',       label: 'All',        count: myBookings.length },
    { key: 'PENDING',   label: 'Pending',    count: myBookings.filter(b => b.status === 'PENDING').length },
    { key: 'APPROVED',  label: 'Approved',   count: myBookings.filter(b => b.status === 'APPROVED').length },
    { key: 'COMPLETED', label: 'Completed',  count: myBookings.filter(b => b.status === 'COMPLETED').length },
    { key: 'CANCELLED', label: 'Cancelled',  count: myBookings.filter(b => b.status === 'CANCELLED' || b.status === 'EXPIRED').length },
  ]

  return (
    <div className="min-h-screen bg-dark-900">
      {cancelTarget && (
        <CancelModal booking={cancelTarget} onConfirm={handleConfirmCancel} onClose={() => setCancelTarget(null)} />
      )}
      {reviewTarget && (
        <ReviewModal booking={reviewTarget} onClose={() => setReviewTarget(null)} />
      )}

      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-white">My Bookings</h1>
            <p className="text-slate-400 text-sm mt-1">Track and manage all your appointments</p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto touch-scroll max-w-full"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {tabs.map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all min-h-[38px] ${
                  filter === tab.key
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    filter === tab.key ? 'bg-primary-600/30 text-primary-300' : 'bg-white/5 text-slate-500'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner size="lg" text="Loading bookings…" />
          ) : (
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="glass-card p-8 sm:p-12 rounded-2xl text-center">
                  <Calendar size={44} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-white font-semibold mb-1">No bookings found</p>
                  <p className="text-slate-500 text-sm mb-6">
                    {filter === 'ALL' ? 'Book your first appointment today!' : `No ${filter.toLowerCase()} bookings.`}
                  </p>
                  <Link to="/salons" className="btn-primary px-6 py-2.5 text-sm min-h-[44px]">Browse Salons</Link>
                </div>
              )}

              {filtered.map(booking => (
                <div key={booking.id} className="glass-card p-4 sm:p-5 rounded-2xl animate-fade-in hover:border-white/15 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.25)' }}>
                        <Scissors size={20} className="text-primary-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold text-sm sm:text-base">{booking.salonName}</h3>
                          <BookingStatusBadge status={booking.status} />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{booking.serviceName} with {booking.barberName}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500">
                            <Calendar size={11} /> {booking.bookingDate}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-slate-500">
                            <Clock size={11} /> {booking.startTime} – {booking.endTime}
                          </div>
                          <span className="text-[11px] sm:text-xs text-slate-600 font-mono">{booking.bookingReference}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-3 border-t border-white/5 sm:border-0 sm:pt-0 w-full sm:w-auto">
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] text-slate-500">Total</p>
                        <p className="text-white font-bold text-base sm:text-lg">₹{booking.totalAmount}</p>
                        <p className="text-[11px] text-slate-500">Fee: ₹{booking.bookingFee}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {(booking.status === 'PENDING' || booking.status === 'APPROVED') && (
                          <button onClick={() => setCancelTarget(booking)} className="btn-danger text-xs py-2 px-3.5 min-h-[38px] sm:min-h-[44px]">
                            Cancel
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <button
                            onClick={() => setReviewTarget(booking)}
                            className="flex items-center gap-1.5 text-xs px-3.5 py-2 min-h-[38px] sm:min-h-[44px] rounded-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors font-semibold"
                          >
                            <MessageSquare size={13} /> Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default CustomerBookingsPage
