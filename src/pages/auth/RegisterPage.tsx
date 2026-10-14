import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Scissors, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { register } from '../../features/auth/authSlice'

const RegisterPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { loading } = useAppSelector(s => s.auth)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: params.get('role') || 'CUSTOMER',
  })

  const roleDestMap: Record<string, string> = {
    CUSTOMER:   '/dashboard/customer',
    OWNER:      '/dashboard/owner',
    BARBER:     '/dashboard/barber',
    ADMIN:      '/dashboard/admin',
    SUPERADMIN: '/dashboard/admin',
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await dispatch(register(form))
    if (register.fulfilled.match(res)) {
      const role: string = res.payload.role
      navigate(roleDestMap[role] || '/')
    }
  }

  const roles = [
    { value: 'CUSTOMER', label: 'Customer', desc: 'Book appointments' },
    { value: 'OWNER', label: 'Salon Owner', desc: 'Manage your salon' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-mesh relative overflow-hidden">
      <div className="glow-orb w-96 h-96 bg-primary-600 -top-48 -right-48" />
      <div className="glow-orb w-96 h-96 bg-accent -bottom-48 -left-48" />

      <div className="w-full max-w-lg animate-slide-up relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
            <Scissors size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Join thousands on SalonEase</p>
        </div>

        <div className="glass-card p-5 sm:p-8 rounded-2xl shadow-card">
          <div className="mb-6">
            <label className="text-xs text-slate-400 font-medium mb-2 block">I am a...</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roles.map(r => (
                <button key={r.value} type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`p-3 rounded-xl text-left border transition-all min-h-[44px] active:scale-[0.99] ${
                    form.role === r.value
                      ? 'border-primary-500 bg-primary-600/15 shadow-glow'
                      : 'border-white/5 hover:border-white/15 bg-dark-800/50'
                  }`}>
                  <p className={`text-xs font-semibold ${form.role === r.value ? 'text-primary-300' : 'text-white'}`}>{r.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type="text" placeholder="John Doe" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Phone <span className="text-slate-600">(optional)</span></label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10 pr-12" required minLength={6} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={showPass ? 'Hide password' : 'Show password'}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 min-h-[44px]">
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
