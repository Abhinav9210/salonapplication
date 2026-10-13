import { Star, Award, CheckCircle } from 'lucide-react'
import type { Barber } from '../../types'

interface Props {
  barber: Barber
  selected?: boolean
  onSelect?: () => void
}

const BarberCard = ({ barber, selected, onSelect }: Props) => (
  <div
    onClick={onSelect}
    className={`rounded-2xl p-4 border transition-all duration-300 cursor-pointer
      ${selected
        ? 'border-primary-500 bg-primary-600/10 shadow-glow'
        : 'glass-card-hover border-transparent'
      }`}
  >
    {/* Avatar */}
    <div className="flex items-center gap-3 mb-3">
      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 relative">
        {barber.profilePicture ? (
          <img src={barber.profilePicture} alt={barber.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
            {barber.name?.[0]?.toUpperCase()}
          </div>
        )}
        {barber.isAvailable && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-dark-900" />
        )}
      </div>
      <div className="min-w-0">
        <h4 className="text-white font-semibold text-sm truncate">{barber.name}</h4>
        <div className="flex items-center gap-1 mt-0.5">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-white font-medium">{barber.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-500">({barber.totalReviews})</span>
        </div>
      </div>
      {selected && (
        <div className="ml-auto">
          <CheckCircle size={18} className="text-primary-400" />
        </div>
      )}
    </div>

    {/* Experience */}
    <div className="flex items-center gap-1.5 mb-2">
      <Award size={12} className="text-accent" />
      <span className="text-xs text-slate-400">{barber.experienceYears} yrs experience</span>
    </div>

    {/* Specializations */}
    {barber.specializations.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {barber.specializations.slice(0, 3).map(s => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary-600/15 text-primary-400 border border-primary-600/20">
            {s}
          </span>
        ))}
        {barber.specializations.length > 3 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-dark-600/50 text-slate-500">
            +{barber.specializations.length - 3}
          </span>
        )}
      </div>
    )}

    {!barber.isAvailable && (
      <div className="mt-2 text-xs text-red-400 font-medium flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-red-400" /> Unavailable
      </div>
    )}
  </div>
)

export default BarberCard
