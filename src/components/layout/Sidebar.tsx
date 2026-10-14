import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Store, Users, Scissors,
  BarChart2, CreditCard, Bell, LogOut,
  Clock, X
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { logout } from '../../features/auth/authSlice'
import { setSidebarOpen } from '../../features/ui/uiSlice'

interface SidebarItem {
  label: string
  path: string
  icon: React.ReactNode
}

const roleMenus: Record<string, SidebarItem[]> = {
  CUSTOMER: [
    { label: 'Overview', path: '/dashboard/customer', icon: <LayoutDashboard size={18} /> },
    { label: 'My Bookings', path: '/dashboard/customer/bookings', icon: <Calendar size={18} /> },
    { label: 'Browse Salons', path: '/salons', icon: <Store size={18} /> },
    { label: 'Notifications', path: '/dashboard/customer/notifications', icon: <Bell size={18} /> },
  ],
  OWNER: [
    { label: 'Overview', path: '/dashboard/owner', icon: <LayoutDashboard size={18} /> },
    { label: 'My Salons', path: '/dashboard/owner/salons', icon: <Store size={18} /> },
    { label: 'Bookings', path: '/dashboard/owner/bookings', icon: <Calendar size={18} /> },
    { label: 'Barbers', path: '/dashboard/owner/barbers', icon: <Scissors size={18} /> },
    { label: 'Services', path: '/dashboard/owner/services', icon: <BarChart2 size={18} /> },
    { label: 'Slots', path: '/dashboard/owner/slots', icon: <Clock size={18} /> },
    { label: 'Analytics', path: '/dashboard/owner/analytics', icon: <BarChart2 size={18} /> },
    { label: 'Payments', path: '/dashboard/owner/payments', icon: <CreditCard size={18} /> },
  ],
  BARBER: [
    { label: 'Overview', path: '/dashboard/barber', icon: <LayoutDashboard size={18} /> },
    { label: 'My Bookings', path: '/dashboard/barber', icon: <Calendar size={18} /> },
  ],
  ADMIN: [
    { label: 'Overview', path: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'All Salons', path: '/dashboard/admin/salons', icon: <Store size={18} /> },
    { label: 'Pending Salons', path: '/dashboard/admin/salons/pending', icon: <Clock size={18} /> },
    { label: 'Users', path: '/dashboard/admin/users', icon: <Users size={18} /> },
  ],
  SUPERADMIN: [
    { label: 'Overview', path: '/dashboard/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'All Salons', path: '/dashboard/admin/salons', icon: <Store size={18} /> },
    { label: 'Pending Salons', path: '/dashboard/admin/salons/pending', icon: <Clock size={18} /> },
    { label: 'Users', path: '/dashboard/admin/users', icon: <Users size={18} /> },
  ],
}

const Sidebar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector(s => s.auth)
  const { sidebarOpen } = useAppSelector(s => s.ui)
  const menu = user ? (roleMenus[user.role] || (user.role === 'SUPERADMIN' ? roleMenus.ADMIN : [])) : []

  const handleLogout = () => {
    dispatch(logout())
    dispatch(setSidebarOpen(false))
    navigate('/login')
  }

  const closeMobile = () => {
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false))
    }
  }

  return (
    <>
      {/* ── Mobile backdrop overlay ── */}
      {sidebarOpen && (
        <div
          onClick={() => dispatch(setSidebarOpen(false))}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* ── Mobile off-canvas drawer ── */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-50 w-72 max-w-[85vw] flex flex-col lg:hidden transition-transform duration-300 ease-out border-r border-white/10 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        }`}
        style={{ background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)' }}
        aria-label="Mobile Dashboard Navigation"
      >
        {/* Mobile drawer header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <span className="text-xs px-1.5 py-0.5 rounded bg-primary-600/20 text-primary-400 font-medium">{user?.role}</span>
            </div>
          </div>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile menu list */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 touch-scroll">
          <ul className="space-y-1.5">
            {menu.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  onClick={closeMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all min-h-[44px]
                    ${isActive
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile drawer logout */}
        <div className="p-3 border-t border-white/5 pb-safe">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all min-h-[44px]"
          >
            <LogOut size={18} className="flex-shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* ── Desktop persistent sidebar ── */}
      <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 hidden lg:flex flex-col
        ${sidebarOpen ? 'w-60' : 'w-16'}`}
        style={{ background: 'rgba(10,15,30,0.95)', borderRight: '1px solid rgba(255,255,255,0.05)' }}>

        {/* User info */}
        <div className={`p-4 border-b border-white/5 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          <div className={`flex items-center gap-3 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary-600/20 text-primary-400">{user?.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menu.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    } ${!sidebarOpen ? 'justify-center' : ''}`
                  }
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-white/5">
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Logout' : undefined}>
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
