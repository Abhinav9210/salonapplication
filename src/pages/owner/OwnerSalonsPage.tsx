import { useState } from 'react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Store, MapPin, Clock, Star, Pencil, X, Loader2,
  CheckCircle, Eye
} from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchMySalons, createSalon } from '../../features/salon/salonSlice'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

const defaultForm = {
  name: '', description: '', address: '', city: '', state: '', pincode: '',
  phone: '', openTime: '09:00', closeTime: '20:00',
  minimumBookingFee: 100, workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
}

const OwnerSalonsPage = () => {
  const dispatch = useAppDispatch()
  const { mySalons, loading } = useAppSelector(s => s.salon)
  const { sidebarOpen } = useAppSelector(s => s.ui)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => { dispatch(fetchMySalons()) }, [])

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.address || !form.city) {
      toast.error('Name, address and city are required')
      return
    }
    setSubmitting(true)
    await dispatch(createSalon(form))
    setSubmitting(false)
    setShowModal(false)
    setForm(defaultForm)
  }

  const statusColor = (status: string) => ({
    APPROVED: 'text-green-400 bg-green-500/10 border-green-500/30',
    PENDING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    REJECTED: 'text-red-400 bg-red-500/10 border-red-500/30',
    SUSPENDED: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  }[status] || 'text-slate-400 bg-slate-500/10')

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">My Salons</h1>
              <p className="text-slate-400 text-sm mt-1">Manage your salon listings</p>
            </div>
            <button onClick={() => setShowModal(true)}
              className="btn-primary text-sm py-2.5 px-5 flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto">
              <Plus size={16} /> New Salon
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading salons..." />
          ) : mySalons.length === 0 ? (
            <div className="glass-card rounded-2xl p-10 sm:p-16 text-center">
              <Store size={56} className="mx-auto text-slate-700 mb-4" />
              <h3 className="text-white font-semibold text-lg mb-2">No Salons Yet</h3>
              <p className="text-slate-500 text-sm mb-6">Create your first salon to start accepting bookings</p>
              <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-2.5 min-h-[44px] inline-flex items-center justify-center">
                <Plus size={16} /> Create Salon
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {mySalons.map(salon => (
                <div key={salon.id} className="glass-card rounded-2xl overflow-hidden group">
                  {/* Color banner */}
                  <div className="h-32 relative flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.15))' }}>
                    <Store size={40} className="text-primary-500/50" />
                    <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full border font-medium ${statusColor(salon.status)}`}>
                      {salon.status}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-white font-semibold text-base">{salon.name}</h3>
                    {salon.description && (
                      <p className="text-slate-500 text-xs mt-1 line-clamp-2">{salon.description}</p>
                    )}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin size={12} className="text-slate-600 flex-shrink-0" />
                        <span className="truncate">{salon.address}, {salon.city}</span>
                      </div>
                      {salon.openTime && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Clock size={12} className="text-slate-600 flex-shrink-0" />
                          <span>{salon.openTime} – {salon.closeTime}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Star size={12} className="text-yellow-500 flex-shrink-0" />
                        <span>{salon.rating.toFixed(1)} ({salon.totalReviews} reviews)</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                      <Link to={`/salons/${salon.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[40px] text-xs text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors border border-white/5 font-medium">
                        <Eye size={13} /> View
                      </Link>
                      <Link to={`/dashboard/owner/salons/${salon.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 min-h-[40px] text-xs text-primary-400 hover:text-primary-300 rounded-lg hover:bg-primary-600/10 transition-colors border border-primary-600/20 font-medium">
                        <Pencil size={13} /> Edit
                      </Link>
                    </div>
                    {salon.status === 'PENDING' && (
                      <p className="text-xs text-yellow-500/80 mt-2 text-center">Awaiting admin approval</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Add new card */}
              <button onClick={() => setShowModal(true)}
                className="glass-card rounded-2xl border-2 border-dashed border-white/10 hover:border-primary-600/40 hover:bg-primary-600/5 transition-all flex flex-col items-center justify-center gap-3 p-12 text-slate-500 hover:text-primary-400">
                <Plus size={36} />
                <span className="text-sm font-medium">Add another salon</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Create Salon Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-xl glass-card rounded-2xl border border-white/10 shadow-card animate-slide-up">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h2 className="text-white font-semibold text-lg">Create New Salon</h2>
                <p className="text-slate-500 text-xs mt-0.5">Fill in your salon details</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Salon Name *</label>
                <input type="text" placeholder="e.g. The Royal Cuts" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field" required />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Description</label>
                <textarea rows={2} placeholder="Tell customers about your salon..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none" />
              </div>

              {/* Address */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1.5 block">Address *</label>
                <input type="text" placeholder="Street address" value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="input-field" required />
              </div>

              {/* City / State / Pincode */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">City *</label>
                  <input type="text" placeholder="Bangalore" value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className="input-field" required />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">State</label>
                  <input type="text" placeholder="Karnataka" value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Pincode</label>
                  <input type="text" placeholder="560001" value={form.pincode}
                    onChange={e => setForm({ ...form, pincode: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              {/* Phone + Min fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Phone</label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Min Booking Fee (₹)</label>
                  <input type="number" min={0} value={form.minimumBookingFee}
                    onChange={e => setForm({ ...form, minimumBookingFee: Number(e.target.value) })}
                    className="input-field" />
                </div>
              </div>

              {/* Open/Close time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Opening Time</label>
                  <input type="time" value={form.openTime}
                    onChange={e => setForm({ ...form, openTime: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Closing Time</label>
                  <input type="time" value={form.closeTime}
                    onChange={e => setForm({ ...form, closeTime: e.target.value })}
                    className="input-field" />
                </div>
              </div>

              {/* Working Days */}
              <div>
                <label className="text-xs text-slate-400 font-medium mb-2 block">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button key={day} type="button" onClick={() => toggleDay(day)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-medium ${
                        form.workingDays.includes(day)
                          ? 'bg-primary-600/20 text-primary-300 border-primary-600/40'
                          : 'text-slate-500 border-white/5 hover:border-white/15'
                      }`}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <><CheckCircle size={16} /> Create Salon</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerSalonsPage
