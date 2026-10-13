import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchMySalons } from '../../features/salon/salonSlice'
import { salonApi } from '../../api/salonApi'
import { serviceApi } from '../../api/index'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { Plus, Clock, DollarSign, X, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { SalonService } from '../../types'

const OwnerServicesPage = () => {
  const dispatch = useAppDispatch()
  const { mySalons } = useAppSelector(s => s.salon)
  const { sidebarOpen } = useAppSelector(s => s.ui)
  const [services, setServices] = useState<SalonService[]>([])
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: 200, durationMinutes: 30 })

  useEffect(() => { dispatch(fetchMySalons()) }, [])
  useEffect(() => {
    if (mySalons.length > 0 && !selectedSalonId) setSelectedSalonId(mySalons[0].id)
  }, [mySalons])
  useEffect(() => {
    if (selectedSalonId) {
      salonApi.getServices(selectedSalonId)
        .then(res => {
          const arr = res.data.data
          setServices((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((s: SalonService) => ({ ...s, isActive: s.isActive ?? (s as SalonService & { active?: boolean }).active ?? false })))
        })
        .catch(() => setServices([]))
    }
  }, [selectedSalonId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSalonId) return
    setSubmitting(true)
    try {
      const res = await serviceApi.add(selectedSalonId, form)
      setServices(prev => [...prev, res.data.data])
      toast.success('Service added!')
      setShowModal(false)
      setForm({ name: '', description: '', price: 200, durationMinutes: 30 })
    } catch { toast.error('Failed to add service') }
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
              <h1 className="text-2xl font-display font-bold text-white">Services</h1>
              <p className="text-slate-400 text-sm mt-1">Define what your salon offers</p>
            </div>
            <div className="flex gap-3">
              {mySalons.length > 1 && (
                <select value={selectedSalonId || ''} onChange={e => setSelectedSalonId(Number(e.target.value))}
                  className="input-field py-2 text-sm">
                  {mySalons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
              <button onClick={() => setShowModal(true)} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
                <Plus size={16} /> Add Service
              </button>
            </div>
          </div>

          {services.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <DollarSign size={48} className="mx-auto text-slate-700 mb-4" />
              <p className="text-white font-semibold mb-2">No services yet</p>
              <p className="text-slate-500 text-sm mb-6">Add services so customers can book them</p>
              <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-2.5">Add Service</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(s => (
                <div key={s.id} className="glass-card p-5 rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold">{s.name}</h4>
                      {s.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{s.description}</p>}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock size={12} className="text-slate-600" /> {s.durationMinutes} mins
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-3">
                      <p className="text-2xl font-bold text-white">₹{s.price}</p>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowModal(true)}
                className="glass-card rounded-2xl border-2 border-dashed border-white/10 hover:border-primary-600/40 hover:bg-primary-600/5 transition-all flex flex-col items-center justify-center gap-2 p-10 text-slate-500 hover:text-primary-400">
                <Plus size={28} />
                <span className="text-xs font-medium">Add service</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-white font-semibold">Add Service</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Service Name *</label>
                <input type="text" placeholder="e.g. Haircut, Shave, Facial..." value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Description</label>
                <textarea rows={2} placeholder="Brief description..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Price (₹) *</label>
                  <input type="number" min={1} value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input-field" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Duration (mins) *</label>
                  <input type="number" min={5} step={5} value={form.durationMinutes}
                    onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="input-field" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} /> Add Service</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerServicesPage
