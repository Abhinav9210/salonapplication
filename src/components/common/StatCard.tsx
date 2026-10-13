interface Props {
  label: string
  value: string | number
  icon?: React.ReactNode
  change?: string
  positive?: boolean
  color?: 'violet' | 'teal' | 'green' | 'yellow' | 'red'
}

const colorMap = {
  violet: { bg: 'rgba(124,58,237,0.12)', text: '#a78bfa', border: 'rgba(124,58,237,0.25)' },
  teal:   { bg: 'rgba(6,182,212,0.12)',  text: '#22d3ee', border: 'rgba(6,182,212,0.25)' },
  green:  { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.25)' },
  yellow: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  red:    { bg: 'rgba(239,68,68,0.12)',  text: '#f87171', border: 'rgba(239,68,68,0.25)' },
}

const StatCard = ({ label, value, icon, change, positive, color = 'violet' }: Props) => {
  const c = colorMap[color]
  return (
    <div className="glass-card p-5 rounded-2xl hover:border-white/15 transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-display font-bold text-white mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 font-medium ${positive ? 'text-green-400' : 'text-red-400'}`}>
              {positive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
