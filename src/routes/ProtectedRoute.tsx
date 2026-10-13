import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks'

interface Props {
  children: React.ReactNode
  roles?: Array<'CUSTOMER' | 'OWNER' | 'BARBER' | 'ADMIN' | 'SUPERADMIN'>
}

export const ProtectedRoute = ({ children, roles }: Props) => {
  const { isAuthenticated, user } = useAppSelector(s => s.auth)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (roles && user) {
    const userRole = user.role
    // Role hierarchy & composition:
    // SUPERADMIN inherits all roles
    // ADMIN inherits OWNER and CUSTOMER
    // OWNER inherits CUSTOMER (can book and manage their personal appointments)
    const hasAccess =
      roles.includes(userRole) ||
      userRole === 'SUPERADMIN' ||
      (userRole === 'ADMIN' && (roles.includes('OWNER') || roles.includes('CUSTOMER'))) ||
      (userRole === 'OWNER' && roles.includes('CUSTOMER'))

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />
    }
  }
  return <>{children}</>
}

export const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAppSelector(s => s.auth)
  if (isAuthenticated && user) {
    const dashMap: Record<string, string> = {
      CUSTOMER: '/dashboard/customer',
      OWNER: '/dashboard/owner',
      BARBER: '/dashboard/barber',
      ADMIN: '/dashboard/admin',
      SUPERADMIN: '/dashboard/admin',
    }
    return <Navigate to={dashMap[user.role] || '/'} replace />
  }
  return <>{children}</>
}
