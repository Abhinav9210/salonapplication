import type { BookingStatus } from '../../types'

interface Props { status: BookingStatus }

const statusMap: Record<BookingStatus, string> = {
  PENDING:   'badge-pending',
  APPROVED:  'badge-approved',
  REJECTED:  'badge-rejected',
  COMPLETED: 'badge-completed',
  CANCELLED: 'badge-cancelled',
  EXPIRED:   'badge-expired',
}

const BookingStatusBadge = ({ status }: Props) => (
  <span className={statusMap[status] || 'badge-cancelled'}>
    {status}
  </span>
)

export default BookingStatusBadge
