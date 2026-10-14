import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Scissors, Bell, Menu, X, LogOut, LayoutDashboard, ChevronDown, Home, Store } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { logout } from '../../features/auth/authSlice'
import { fetchUnreadCount } from '../../features/notification/notificationSlice'
import { toggleSidebar } from '../../features/ui/uiSlice'
import NotificationPanel from './NotificationPanel'

const Navbar = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAppSelector(s => s.auth)
  const { unreadCount } = useAppSelector(s => s.notification)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchUnreadCount())
  }, [dispatch, isAuthenticated])

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleLogout = () => { dispatch(logout()); navigate('/login') }

  const dashboardPath = user ? ({
    CUSTOMER: '/dashboard/customer',
    OWNER: '/dashboard/owner',
    BARBER: '/dashboard/barber',
    ADMIN: '/dashboard/admin',
    SUPERADMIN: '/dashboard/admin',
  } as Record<string, string>)[user.role] || '/' : '/'

  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
      style={{ background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: sidebar toggle (mobile dashboard) + logo */}
          <div className="flex items-center gap-3">
            {isDashboard && (
              <button onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Toggle navigation drawer">
                <Menu size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                <Scissors size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white hidden sm:block">
                Salon<span className="text-gradient">Ease</span>
              </span>
            </Link>
          </div>

          {/* Centre: nav links (not on dashboard) */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-1">
              <NavPill to="/" icon={<Home size={15} />} label="Home" />
              {(!user || user.role === 'CUSTOMER') && (
                <NavPill to="/salons" icon={<Store size={15} />} label="Salons" />
              )}
              {isAuthenticated && <NavPill to={dashboardPath} icon={<LayoutDashboard size={15} />} label="Dashboard" />}
            </div>
          )}

          {/* Right: notifications + profile */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button onClick={() => { setProfileOpen(false); setNotifOpen(v => !v) }}
                    className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-xs font-bold text-white flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', fontSize: '10px' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button onClick={() => { setNotifOpen(false); setProfileOpen(v => !v) }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
                      <p className="text-xs text-slate-400 leading-tight">{user?.role}</p>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 hidden sm:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl shadow-card border border-white/10 py-1 z-50 animate-fade-in"
                      style={{ background: 'rgba(15,23,42,0.98)', backdropFilter: 'blur(20px)' }}>
                      <Link to={dashboardPath}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                        onClick={() => setProfileOpen(false)}>
                        <LayoutDashboard size={15} /> Dashboard
                      </Link>
                      <hr className="my-1 border-white/5" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors">
                        <LogOut size={15} /> Log out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link to="/login" className="btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm min-h-[38px] sm:min-h-[44px]">Sign In</Link>
                <Link to="/register" className="btn-primary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm min-h-[38px] sm:min-h-[44px] hidden xs:inline-flex sm:inline-flex">Get Started</Link>
              </div>
            )}

            {/* Mobile menu toggle (public routes) */}
            {!isDashboard && (
              <button onClick={() => setMobileMenuOpen(v => !v)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && !isDashboard && (
        <div className="md:hidden border-t border-white/5 px-4 py-3 space-y-1.5 animate-fade-in pb-safe"
          style={{ background: 'rgba(10,15,30,0.98)', backdropFilter: 'blur(20px)' }}>
          <MobileLink to="/" icon={<Home size={18} />} label="Home" onClick={() => setMobileMenuOpen(false)} />
          {(!user || user.role === 'CUSTOMER') && (
            <MobileLink to="/salons" icon={<Store size={18} />} label="Browse Salons" onClick={() => setMobileMenuOpen(false)} />
          )}
          {isAuthenticated ? (
            <>
              <MobileLink to={dashboardPath} icon={<LayoutDashboard size={18} />} label="Dashboard" onClick={() => setMobileMenuOpen(false)} />
              <button onClick={() => { setMobileMenuOpen(false); handleLogout() }}
                className="w-full text-left flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 min-h-[44px] transition-colors">
                <LogOut size={18} /> Log out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-white/5 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn-secondary w-full py-2.5 text-sm text-center">
                Sign In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full py-2.5 text-sm text-center">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

const NavPill = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation()
  const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  return (
    <Link to={to}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? 'bg-primary-600/20 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}>
      {icon}{label}
    </Link>
  )
}

const MobileLink = ({ to, icon, label, onClick }: { to: string; icon: React.ReactNode; label: string; onClick: () => void }) => {
  const location = useLocation()
  const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
  return (
    <Link to={to} onClick={onClick}
      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px] ${
        active
          ? 'bg-primary-600/20 text-primary-300 border border-primary-600/30'
          : 'text-slate-300 hover:text-white hover:bg-white/5'
      }`}>
      {icon}
      <span>{label}</span>
    </Link>
  )
}

export default Navbar
