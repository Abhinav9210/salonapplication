import { useEffect } from 'react'
import { Bell, Check } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchNotifications, markAllRead } from '../../features/notification/notificationSlice'
import { formatDistanceToNow } from 'date-fns'

const NotificationPanel = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useAppDispatch()
  const { notifications, loading } = useAppSelector(s => s.notification)

  useEffect(() => { dispatch(fetchNotifications()) }, [dispatch])

  const typeColors: Record<string, string> = {
    BOOKING_APPROVED: 'bg-green-500/20 text-green-400',
    BOOKING_REJECTED: 'bg-red-500/20 text-red-400',
    BOOKING_CREATED: 'bg-blue-500/20 text-blue-400',
    BOOKING_COMPLETED: 'bg-purple-500/20 text-purple-400',
    BOOKING_CANCELLED: 'bg-gray-500/20 text-gray-400',
    PAYMENT_SUCCESS: 'bg-teal-500/20 text-teal-400',
  }

  return (
    <div className="absolute -right-2 sm:right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm sm:w-80 glass-card rounded-2xl shadow-card border border-white/10 z-50 animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary-400" />
          <span className="text-sm font-semibold text-white">Notifications</span>
        </div>
        <button onClick={() => { dispatch(markAllRead()); onClose() }}
          className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
          <Check size={12} /> Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
        {loading && (
          <div className="p-6 text-center text-slate-500 text-sm">Loading...</div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="p-6 text-center text-slate-500 text-sm">
            <Bell size={32} className="mx-auto mb-2 opacity-30" />
            No notifications yet
          </div>
        )}
        {notifications.map(n => (
          <div key={n.id}
            className={`px-4 py-3 transition-colors hover:bg-white/3 ${!n.isRead ? 'bg-primary-600/5' : ''}`}>
            <div className="flex items-start gap-2.5">
              <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 ${typeColors[n.type] || 'bg-slate-500/20 text-slate-400'}`}>
                {n.type.split('_')[0]}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white leading-snug">{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-slate-600 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationPanel
