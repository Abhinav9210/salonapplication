interface Props {
  value: number
  max?: number
  precision?: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const StarRating = ({ value, max = 5, precision = 1, showLabel = false, size = 'md' }: Props) => {
  const sizeMap = { sm: 12, md: 16, lg: 20 }
  const px = sizeMap[size]

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(value)
        const half = !filled && i < value
        return (
          <svg key={i} width={px} height={px} viewBox="0 0 24 24" fill={filled ? '#facc15' : 'none'} stroke={filled || half ? '#facc15' : '#475569'} strokeWidth="2">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="50%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={`url(#half-${i})`} stroke="#facc15" />
              </>
            ) : (
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            )}
          </svg>
        )
      })}
      {showLabel && (
        <span className="text-sm font-semibold text-white ml-1">{value.toFixed(precision)}</span>
      )}
    </div>
  )
}

export default StarRating
