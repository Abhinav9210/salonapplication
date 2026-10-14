import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Scissors, Mail, Lock, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { login } from '../../features/auth/authSlice'

const LoginPage = () => {
  const dispatch    = useAppDispatch()
  const navigate    = useNavigate()
  const location    = useLocation()
  const { user, loading } = useAppSelector(s => s.auth)
  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)

  // After successful login, redirect where the user came from, or to their role's dashboard
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || null

  const roleDestMap: Record<string, string> = {
    CUSTOMER:   '/dashboard/customer',
    OWNER:      '/dashboard/owner',
    BARBER:     '/dashboard/barber',
    ADMIN:      '/dashboard/admin',
    SUPERADMIN: '/dashboard/admin',
  }

  useEffect(() => {
    if (user) {
      const dest = roleDestMap[user.role] || '/dashboard/customer'
      navigate(dest, { replace: true })
    }
  }, [user, navigate])

  // ── Auth logic preserved and role redirection enforced ───────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await dispatch(login(form))
    if (login.fulfilled.match(res)) {
      const role: string = res.payload.role
      // OWNER, BARBER, and ADMIN are redirected directly to their dashboards immediately.
      // CUSTOMER can return to their intended destination if valid (e.g. salon booking) or customer dashboard.
      let dest = roleDestMap[role] || '/dashboard/customer'
      if (role === 'CUSTOMER' && from && !from.startsWith('/dashboard/owner') && !from.startsWith('/dashboard/barber') && !from.startsWith('/dashboard/admin') && from !== '/') {
        dest = from
      }
      navigate(dest, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-mesh relative overflow-hidden">
      {/* Ambient glow */}
      <div className="glow-orb w-[500px] h-[500px] bg-primary-700 -top-60 -left-60" />
      <div className="glow-orb w-[400px] h-[400px] bg-accent -bottom-40 -right-40" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-5 shadow-glow"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
            <Scissors size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your SalonEase account</p>
        </div>

        <div className="glass-card p-5 sm:p-8 rounded-2xl shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" id="login-form">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="text-xs text-slate-400 font-medium mb-1.5 block">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="text-xs text-slate-400 font-medium mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-12"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-1 min-h-[44px]"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
