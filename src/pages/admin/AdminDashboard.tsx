import type { DashboardAnalytics, Salon, User as SalonUser } from '../../types'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Shield, Users, Store, BarChart2, CheckCircle, XCircle, Clock,
  TrendingUp, AlertCircle, Search, RefreshCw
} from 'lucide-react'
import { adminApi } from '../../api/index'
import StatCard from '../../components/common/StatCard'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Sidebar from '../../components/layout/Sidebar'
import Navbar from '../../components/layout/Navbar'
import { useAppSelector } from '../../app/hooks'
import toast from 'react-hot-toast'

type AdminView = 'overview' | 'pending' | 'salons' | 'users'

const AdminDashboard = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen } = useAppSelector(s => s.ui)

  // Determine active tab from URL
  const getTab = (): AdminView => {
    if (location.pathname.includes('pending')) return 'pending'
    if (location.pathname.includes('salons')) return 'salons'
    if (location.pathname.includes('users')) return 'users'
    return 'overview'
  }
  const activeTab = getTab()
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null)
  const [pendingSalons, setPendingSalons] = useState<Salon[]>([])
  const [allSalons, setAllSalons] = useState<Salon[]>([])
  const [users, setUsers] = useState<SalonUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [salonSearch, setSalonSearch] = useState('')

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const [a, ps, as_, u] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getPendingSalons(),
        adminApi.getAllSalons(),
        adminApi.getAllUsers(),
      ])
      setAnalytics(a.data.data)
      const psData = ps.data.data
      setPendingSalons(Array.isArray(psData) ? psData : (psData?.content ?? []))
      const asData = as_.data.data
      setAllSalons(Array.isArray(asData) ? asData : (asData?.content ?? []))
      const uData = u.data.data
      const uArray = Array.isArray(uData) ? uData : (uData?.content ?? [])
      setUsers(uArray.map((user: SalonUser) => ({ ...user, isActive: user.isActive ?? (user as SalonUser & { active?: boolean }).active ?? false })))
    } catch (e) {
      const error = e as { response?: { data?: { message?: string } }; message?: string }
      toast.error('Failed to load admin data: ' + (error?.response?.data?.message || error?.message || 'Unknown error'))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleApproveSalon = async (id: number) => {
    try {
      await adminApi.approveSalon(id)
      setPendingSalons(prev => prev.filter(s => s.id !== id))
      setAllSalons(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' as Salon['status'] } : s))
      toast.success('Salon approved! ✅')
    } catch { toast.error('Failed to approve salon') }
  }

  const handleRejectSalon = async (id: number) => {
    try {
      await adminApi.rejectSalon(id)
      setPendingSalons(prev => prev.filter(s => s.id !== id))
      setAllSalons(prev => prev.map(s => s.id === id ? { ...s, status: 'REJECTED' as Salon['status'] } : s))
      toast.success('Salon rejected')
    } catch { toast.error('Failed to reject salon') }
  }

  const handleDeleteSalon = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this salon and all its nested data? This action cannot be undone.')) return;
    try {
      await adminApi.deleteSalon(id)
      setAllSalons(prev => prev.filter(s => s.id !== id))
      setPendingSalons(prev => prev.filter(s => s.id !== id))
      toast.success('Salon permanently removed')
    } catch { toast.error('Failed to delete salon') }
  }

  const handleToggleUser = async (id: number) => {
    try {
      await adminApi.toggleUserStatus(id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u))
      toast.success('User status updated')
    } catch { toast.error('Failed to update user') }
  }

  const navTabs: { key: AdminView; label: string; path: string; icon: React.ReactNode; badge?: number }[] = [
    { key: 'overview',  label: 'Overview',        path: '/dashboard/admin',              icon: <BarChart2 size={16} /> },
    { key: 'pending',   label: 'Pending Salons',  path: '/dashboard/admin/salons/pending', icon: <Clock size={16} />,  badge: pendingSalons.length },
    { key: 'salons',    label: 'All Salons',       path: '/dashboard/admin/salons',       icon: <Store size={16} /> },
    { key: 'users',     label: 'Users',            path: '/dashboard/admin/users',        icon: <Users size={16} /> },
  ]

  const filteredUsers = users.filter(u =>
    !userSearch || [u.name, u.email, u.role.toString()].some(v => v?.toLowerCase().includes(userSearch.toLowerCase()))
  )
  const filteredSalons = allSalons.filter(s =>
    !salonSearch || [s.name, s.city, s.status.toString()].some(v => v?.toLowerCase().includes(salonSearch.toLowerCase()))
  )

  const statusColor = (status: string) => ({
    APPROVED: 'bg-green-500/15 text-green-400 border-green-500/20',
    PENDING:  'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    REJECTED: 'bg-red-500/15 text-red-400 border-red-500/20',
    SUSPENDED:'bg-gray-500/15 text-gray-400 border-gray-500/20',
  }[status] || 'bg-slate-500/15 text-slate-400')

  const roleColor = (role: string) => ({
    ADMIN:    'bg-purple-500/15 text-purple-400',
    OWNER:    'bg-blue-500/15 text-blue-400',
    BARBER:   'bg-teal-500/15 text-teal-400',
    CUSTOMER: 'bg-slate-500/15 text-slate-400',
  }[role] || 'bg-slate-500/15 text-slate-400')

  if (loading) return (
    <div className="min-h-screen bg-dark-900">
      <Navbar /><Sidebar />
      <main className={`pt-16 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <LoadingSpinner fullPage text="Loading admin dashboard..." />
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Shield size={24} className="text-primary-400" /> Admin Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Platform management and oversight</p>
            </div>
            <button onClick={() => loadData(true)} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-white/5 hover:bg-white/5 transition-colors">
              <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {/* Sub-nav tabs */}
          <div className="flex gap-1 p-1 rounded-xl mb-6 overflow-x-auto"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}>
            {navTabs.map(tab => (
              <button key={tab.key} onClick={() => navigate(tab.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                {tab.icon}
                {tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="ml-0.5 w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ─── OVERVIEW ─────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Bookings"  value={analytics?.totalBookings ?? 0}  icon={<BarChart2 size={18} />}    color="violet" />
                <StatCard label="Completed"        value={analytics?.completedBookings ?? 0} icon={<CheckCircle size={18} />} color="green" />
                <StatCard label="Total Revenue"    value={`₹${Math.round(analytics?.totalEarnings ?? 0).toLocaleString()}`} icon={<TrendingUp size={18} />}  color="teal" />
                <StatCard label="Pending Salons"   value={pendingSalons.length}           icon={<Clock size={18} />}        color="yellow" />
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="glass-card p-5 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Salons</p>
                  <p className="text-3xl font-bold text-white mt-1">{allSalons.length}</p>
                  <p className="text-xs text-slate-500 mt-1">{allSalons.filter(s => s.status === 'APPROVED').length} approved · {pendingSalons.length} pending</p>
                </div>
                <div className="glass-card p-5 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Total Users</p>
                  <p className="text-3xl font-bold text-white mt-1">{users.length}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {users.filter(u => u.role.toString() === 'CUSTOMER').length} customers · {users.filter(u => u.role.toString() === 'OWNER').length} owners · {users.filter(u => u.role.toString() === 'BARBER').length} barbers · {users.filter(u => u.role.toString() === 'ADMIN').length} admins
                  </p>
                </div>
                <div className="glass-card p-5 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Cancelled Bookings</p>
                  <p className="text-3xl font-bold text-white mt-1">{analytics?.cancelledBookings ?? 0}</p>
                  <p className="text-xs text-slate-500 mt-1">{analytics?.pendingBookings ?? 0} currently pending</p>
                </div>
              </div>

              {/* Pending salons quick view */}
              {pendingSalons.length > 0 && (
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-yellow-400" />
                      <h3 className="text-white font-semibold">Pending Approvals</h3>
                    </div>
                    <button onClick={() => navigate('/dashboard/admin/salons/pending')}
                      className="text-xs text-primary-400 hover:text-primary-300">View all →</button>
                  </div>
                  {pendingSalons.slice(0, 3).map(s => (
                    <div key={s.id} className="p-4 flex items-center justify-between border-b border-white/5 last:border-0">
                      <div>
                        <p className="text-white text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.city} · {s.ownerName}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveSalon(s.id)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => handleRejectSalon(s.id)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ─── PENDING SALONS ───────────────────────────── */}
          {activeTab === 'pending' && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex items-center gap-2">
                <Clock size={16} className="text-yellow-400" />
                <h3 className="text-white font-semibold">Pending Salon Approvals ({pendingSalons.length})</h3>
              </div>
              {pendingSalons.length === 0 ? (
                <div className="p-16 text-center">
                  <CheckCircle size={44} className="mx-auto text-green-500/30 mb-3" />
                  <p className="text-white font-medium">All caught up! 🎉</p>
                  <p className="text-slate-500 text-sm mt-1">No pending salons to review</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {pendingSalons.map(s => (
                    <div key={s.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{s.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(s.status)}`}>{s.status}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">📍 {s.address}, {s.city}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Owner: {s.ownerName} · Min fee: ₹{s.minimumBookingFee}</p>
                        {s.description && <p className="text-xs text-slate-600 mt-1 line-clamp-1">{s.description}</p>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => handleApproveSalon(s.id)}
                          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors font-medium">
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => handleRejectSalon(s.id)}
                          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors font-medium">
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── ALL SALONS ───────────────────────────────── */}
          {activeTab === 'salons' && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Store size={16} className="text-primary-400" />
                  <h3 className="text-white font-semibold">All Salons ({filteredSalons.length})</h3>
                </div>
                <div className="relative sm:w-64">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={salonSearch} onChange={e => setSalonSearch(e.target.value)}
                    placeholder="Search salons..." className="input-field pl-9 py-2 text-sm" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Salon', 'Owner', 'City', 'Rating', 'Status', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredSalons.map(s => (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm text-white font-medium">{s.name}</p>
                          <p className="text-xs text-slate-600 truncate max-w-[180px]">{s.description}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{s.ownerName}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{s.city}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className="text-yellow-400">⭐ {(s.rating ?? 0).toFixed(1)}</span>
                          <span className="text-slate-600 ml-1">({s.totalReviews ?? 0})</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(s.status)}`}>{s.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          {s.status === 'PENDING' && (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleApproveSalon(s.id)}
                                className="text-xs px-2 py-1 rounded text-green-400 border border-green-500/20 hover:bg-green-500/10">✓</button>
                              <button onClick={() => handleRejectSalon(s.id)}
                                className="text-xs px-2 py-1 rounded text-red-400 border border-red-500/20 hover:bg-red-500/10">✗</button>
                            </div>
                          )}
                          {s.status === 'APPROVED' && (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                          {s.status === 'REJECTED' && (
                            <button onClick={() => handleApproveSalon(s.id)}
                              className="text-xs px-2 py-1 rounded text-blue-400 border border-blue-500/20 hover:bg-blue-500/10">Re-approve</button>
                          )}
                          <button onClick={() => handleDeleteSalon(s.id)}
                            className="text-xs px-2 py-1 rounded text-red-500 border border-red-500/20 hover:bg-red-500/10 ml-2" title="Permanently delete">
                            <XCircle size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── USERS ────────────────────────────────────── */}
          {activeTab === 'users' && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <Users size={16} className="text-primary-400" />
                  <h3 className="text-white font-semibold">All Users ({filteredUsers.length})</h3>
                </div>
                <div className="relative sm:w-64">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={userSearch} onChange={e => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, role..." className="input-field pl-9 py-2 text-sm" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Name', 'Email', 'Role', 'Status', 'Joined', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <p className="text-sm text-white font-medium">{u.name}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${roleColor(u.role.toString())}`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleToggleUser(u.id)}
                            className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                              u.isActive
                                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                                : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                            }`}>
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
