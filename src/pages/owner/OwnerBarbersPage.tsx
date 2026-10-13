import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchMySalons } from '../../features/salon/salonSlice'
import { barberApi } from '../../api/index'
import { salonApi } from '../../api/salonApi'
import { authApi } from '../../api/authApi'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { Plus, Star, Scissors, X, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Barber } from '../../types'

const OwnerBarbersPage = () => {
  const dispatch = useAppDispatch()
  const { mySalons } = useAppSelector(s => s.salon)
  const { sidebarOpen } = useAppSelector(s => s.ui)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '', bio: '', experienceYears: 1,
    specializations: [] as string[], salonId: 0
  })
  const [specInput, setSpecInput] = useState('')

  useEffect(() => { dispatch(fetchMySalons()) }, [])
  useEffect(() => {
    if (mySalons.length > 0 && !selectedSalonId) {
      setSelectedSalonId(mySalons[0].id)
      setForm(f => ({ ...f, salonId: mySalons[0].id }))
    }
  }, [mySalons])

  useEffect(() => {
    if (selectedSalonId) {
      salonApi.getBarbers(selectedSalonId)
        .then(res => {
          const arr = res.data.data
          setBarbers((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((b: Barber) => ({ ...b, isAvailable: b.isAvailable ?? (b as Barber & { available?: boolean }).available ?? false })))
        })
        .catch(() => setBarbers([]))
    }
  }, [selectedSalonId])

  const addSpec = () => {
    if (specInput.trim()) {
      setForm(f => ({ ...f, specializations: [...f.specializations, specInput.trim()] }))
      setSpecInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // 1. Create User account first (frontend explicit call as requested)
      let finalUserId: number | null = null
      try {
        const userRes = await authApi.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'BARBER',
        })
        finalUserId = userRes.data.data.userId
      } catch (err) {
        const error = err as { response?: { status?: number } }
        // If email already exists, backend BarberService handles linking
        if (error.response?.status !== 400 && error.response?.status !== 409) {
          throw err
        }
      }

      // 2. Add Barber
      const res = await barberApi.add({ ...form, salonId: selectedSalonId, userId: finalUserId })
      setBarbers(prev => [...prev, res.data.data])
      toast.success('Barber added!')
      setShowModal(false)
      setForm({ name: '', email: '', bio: '', experienceYears: 1, specializations: [], salonId: selectedSalonId!, password: '' })
    } catch (e) {
      const error = e as { response?: { data?: { message?: string } } }
      toast.error(error?.response?.data?.message || 'Failed to add barber')
    }
    finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Barbers</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your team</p>
            </div>
            <div className="flex gap-3">
              {mySalons.length > 1 && (
                <select value={selectedSalonId || ''} onChange={e => setSelectedSalonId(Number(e.target.value))}
                  className="input-field py-2 text-sm">
                  {mySalons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              <button onClick={() => setShowModal(true)} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
                <Plus size={16} /> Add Barber
              </button>
            </div>
          </div>

          {barbers.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <Scissors size={52} className="mx-auto text-slate-700 mb-4" />
              <p className="text-white font-semibold mb-1">No barbers yet</p>
              <p className="text-slate-500 text-sm mb-6">Add your team members to start accepting appointments</p>
              <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-2.5">Add Barber</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {barbers.map(b => (
                <div key={b.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#7c3aed,#06b6d4)' }}>
                      {b.name[0]}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{b.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={11} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-white">{b.rating.toFixed(1)}</span>
                        <span className="text-xs text-slate-500">· {b.experienceYears} yrs</span>
                      </div>
                    </div>
                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${b.isAvailable ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                      {b.isAvailable ? 'Available' : 'Off'}
                    </span>
                  </div>
                  {b.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {b.specializations.map(s => (
                        <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary-600/15 text-primary-400">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-white font-semibold">Add Barber</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Full Name *</label>
                <input type="text" placeholder="John Smith" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Email *</label>
                <input type="email" placeholder="john@salon.com" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Password *</label>
                <input type="password" placeholder="Set a login password for barber" value={form.password || ''}
                  onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Bio</label>
                <textarea rows={2} placeholder="Specializes in..." value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })} className="input-field resize-none" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Experience (years)</label>
                <input type="number" min={0} value={form.experienceYears}
                  onChange={e => setForm({ ...form, experienceYears: Number(e.target.value) })} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Specializations</label>
                <div className="flex gap-2 mb-2">
                  <input value={specInput} onChange={e => setSpecInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())}
                    placeholder="e.g. Fade, Beard trim..." className="input-field flex-1 text-sm py-2" />
                  <button type="button" onClick={addSpec} className="btn-secondary py-2 px-3 text-xs">Add</button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {form.specializations.map((s, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-600/15 text-primary-400">
                      {s}
                      <button type="button" onClick={() => setForm(f => ({ ...f, specializations: f.specializations.filter((_, j) => j !== i) }))}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} /> Add Barber</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerBarbersPage
