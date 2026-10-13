import { Loader2 } from 'lucide-react'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
  text?: string
}

const LoadingSpinner = ({ size = 'md', fullPage, text }: Props) => {
  const sizeMap = { sm: 16, md: 24, lg: 40 }
  const px = sizeMap[size]

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 size={px} className="text-primary-400 animate-spin" />
      {text && <p className="text-sm text-slate-400">{text}</p>}
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {spinner}
      </div>
    )
  }
  return spinner
}

export default LoadingSpinner
