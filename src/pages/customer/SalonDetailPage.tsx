import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Clock, Phone, Scissors, ChevronLeft, ArrowRight, Shield } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchSalonById } from '../../features/salon/salonSlice'
import { salonApi } from '../../api/salonApi'
import { reviewApi } from '../../api/index'
import type { Barber, SalonService, Review } from '../../types'
import BarberCard from '../../components/common/BarberCard'
import StarRating from '../../components/common/StarRating'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Navbar from '../../components/layout/Navbar'

const SalonDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const { currentSalon, loading } = useAppSelector(s => s.salon)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<SalonService[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [activeTab, setActiveTab] = useState<'barbers' | 'services' | 'reviews'>('barbers')

  useEffect(() => {
    if (id) {
      dispatch(fetchSalonById(Number(id)))
      salonApi.getBarbers(Number(id)).then(r => {
        const arr = r.data.data
        setBarbers((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((b: Barber) => ({ ...b, isAvailable: b.isAvailable ?? (b as Barber & { available?: boolean }).available ?? false })))
      })
      salonApi.getServices(Number(id)).then(r => {
        const arr = r.data.data
        setServices((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((s: SalonService) => ({ ...s, isActive: s.isActive ?? (s as SalonService & { active?: boolean }).active ?? false })))
      })
      reviewApi.getSalonReviews(Number(id)).then(r => setReviews(r.data.data.content || []))
    }
  }, [id])

  if (loading) return <><Navbar /><LoadingSpinner fullPage text="Loading salon..." /></>
  if (!currentSalon) return <><Navbar /><div className="pt-24 text-center text-slate-400">Salon not found</div></>

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-20">
        {/* Hero */}
        <div className="h-64 sm:h-80 relative overflow-hidden">
          {currentSalon.images?.[0] ? (
            <img src={currentSalon.images[0]} alt={currentSalon.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))' }}>
              <Scissors size={60} className="text-primary-600/40" />
            </div>
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,15,30,1) 0%, rgba(10,15,30,0.4) 60%, transparent 100%)' }} />
          <Link to="/salons" className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white"
            style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronLeft size={16} /> Back
          </Link>
        </div>

        <div className="page-container -mt-16 relative z-10 pb-16">
          {/* Salon header */}
          <div className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-display font-bold text-white">{currentSalon.name}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-500" />
                    <span className="text-sm text-slate-400">{currentSalon.address}, {currentSalon.city}</span>
                  </div>
                  {currentSalon.phone && (
                    <div className="flex items-center gap-1">
                      <Phone size={13} className="text-slate-500" />
                      <span className="text-sm text-slate-400">{currentSalon.phone}</span>
                    </div>
                  )}
                  {currentSalon.openTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={13} className="text-slate-500" />
                      <span className="text-sm text-slate-400">{currentSalon.openTime} – {currentSalon.closeTime}</span>
                    </div>
                  )}
                </div>
                {currentSalon.description && (
                  <p className="text-slate-400 text-sm mt-3 leading-relaxed max-w-2xl">{currentSalon.description}</p>
                )}
              </div>
              <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                <StarRating value={currentSalon.rating} showLabel size="md" />
                <span className="text-sm text-slate-500">({currentSalon.totalReviews} reviews)</span>
                <div className="flex items-center gap-1.5 text-sm text-slate-400">
                  <Shield size={13} className="text-green-400" />
                  Min booking: <span className="text-white font-semibold">₹{currentSalon.minimumBookingFee}</span>
                </div>
                <Link to={`/salons/${id}/book`} className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm mt-1 min-h-[44px] flex items-center justify-center gap-2">
                  Book Appointment <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex w-full sm:w-fit gap-1 mb-6 p-1 rounded-xl overflow-x-auto touch-scroll"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {(['barbers', 'services', 'reviews'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all min-h-[44px] whitespace-nowrap flex items-center justify-center ${
                  activeTab === tab
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}>
                {tab}
                {tab === 'barbers' && ` (${barbers.length})`}
                {tab === 'services' && ` (${services.length})`}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          {/* Barbers */}
          {activeTab === 'barbers' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {barbers.map(b => <BarberCard key={b.id} barber={b} />)}
              {barbers.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No barbers listed yet.</p>}
            </div>
          )}

          {/* Services */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <div key={s.id} className="glass-card p-5 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-white font-semibold">{s.name}</h4>
                      {s.description && <p className="text-slate-500 text-xs mt-1">{s.description}</p>}
                      <div className="flex items-center gap-1 mt-2">
                        <Clock size={12} className="text-slate-500" />
                        <span className="text-xs text-slate-400">{s.durationMinutes} mins</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-white">₹{s.price}</p>
                  </div>
                </div>
              ))}
              {services.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No services listed yet.</p>}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="glass-card p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                      {r.customerName?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{r.customerName}</p>
                        <StarRating value={r.rating} size="sm" />
                      </div>
                      {r.comment && <p className="text-sm text-slate-400 mt-1">{r.comment}</p>}
                      <p className="text-xs text-slate-600 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length === 0 && <p className="text-slate-500 text-center py-10">No reviews yet.</p>}
            </div>
          )}
        </div>

        {/* Sticky Mobile Book CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:hidden z-40 bg-dark-950/95 backdrop-blur-lg border-t border-white/10 pb-safe">
          <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
            <div>
              <p className="text-[10px] text-slate-400">Min Booking</p>
              <p className="text-white font-bold text-base">₹{currentSalon.minimumBookingFee}</p>
            </div>
            <Link to={`/salons/${id}/book`} className="btn-primary flex-1 py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-1.5 min-h-[44px]">
              Book Appointment <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalonDetailPage
