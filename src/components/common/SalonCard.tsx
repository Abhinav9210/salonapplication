import { Star, Scissors, MapPin, Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Salon } from '../../types'

interface Props { salon: Salon }

// ── Skeleton variant ──────────────────────────────────────────────────────────
export const SalonCardSkeleton = () => (
  <div className="skeleton-card rounded-2xl overflow-hidden h-full" aria-hidden="true">
    <div className="h-44 skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-4 skeleton w-3/4" />
      <div className="h-3 skeleton w-1/2" />
      <div className="h-3 skeleton w-full" />
      <div className="h-3 skeleton w-5/6" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-3 skeleton w-16" />
        <div className="h-3 skeleton w-20" />
      </div>
      <div className="h-8 skeleton w-full rounded-xl mt-1" />
    </div>
  </div>
)

// ── Main card ─────────────────────────────────────────────────────────────────
const SalonCard = ({ salon }: Props) => {
  const nav = useNavigate()
  const heroImage = salon.images?.[0] || null
  const days = salon.workingDays?.slice(0, 3).map(d => d.slice(0, 3)) || []

  return (
    <div
      onClick={() => nav(`/salons/${salon.id}`)}
      className="block group cursor-pointer animate-fade-in"
      role="article"
      aria-label={`${salon.name} salon`}
    >
      <div className="glass-card-hover rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="h-44 overflow-hidden relative bg-dark-700 flex-shrink-0">
          {heroImage ? (
            <img
              src={heroImage} alt={salon.name} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))' }}>
              <Scissors size={44} className="text-primary-600/40" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Booking fee badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold text-white"
            style={{ background: 'rgba(10,15,30,0.82)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            ₹{salon.minimumBookingFee} min
          </div>

          {/* Rating pill — bottom-left overlay */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(10,15,30,0.82)', backdropFilter: 'blur(6px)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <Star size={11} className="text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-300">{salon.rating?.toFixed(1) ?? '0.0'}</span>
            <span className="text-slate-500 font-normal ml-0.5">({salon.totalReviews ?? 0})</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-white font-semibold text-base leading-snug group-hover:text-primary-300 transition-colors line-clamp-1 mb-1">
            {salon.name}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <MapPin size={11} className="text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-400 truncate">{salon.city}{salon.state ? `, ${salon.state}` : ''}</span>
          </div>

          {salon.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3 flex-1">{salon.description}</p>
          )}

          <div className="mt-auto">
            {/* Working days + open time row */}
            <div className="flex items-center justify-between mb-3">
              {days.length > 0 && (
                <div className="flex gap-1">
                  {days.map(d => (
                    <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-primary-600/15 text-primary-400 font-medium">{d}</span>
                  ))}
                  {(salon.workingDays?.length ?? 0) > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500">+{(salon.workingDays?.length ?? 0) - 3}</span>
                  )}
                </div>
              )}
              {salon.openTime && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock size={10} />
                  {salon.openTime}–{salon.closeTime}
                </div>
              )}
            </div>

            {/* CTA */}
            <div
              onClick={(e) => { e.stopPropagation(); nav(`/salons/${salon.id}/book`) }}
              className="w-full btn-primary py-2 text-xs text-center flex items-center justify-center gap-1.5"
              role="button"
              tabIndex={0}
            >
              Book Now <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalonCard
