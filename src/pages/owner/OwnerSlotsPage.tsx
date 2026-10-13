import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchMySalons } from '../../features/salon/salonSlice'
import { salonApi } from '../../api/salonApi'
import { slotApi } from '../../api/index'
import Navbar from '../../components/layout/Navbar'
import Sidebar from '../../components/layout/Sidebar'
import { Clock, Plus, Loader2, CheckCircle, X } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import type { Barber, TimeSlot } from '../../types'

const OwnerSlotsPage = () => {
  const dispatch = useAppDispatch()
  const { mySalons } = useAppSelector(s => s.salon)
  const { sidebarOpen } = useAppSelector(s => s.ui)
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null)
  const [selectedBarberId, setSelectedBarberId] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [genForm, setGenForm] = useState({
    startTime: '09:00', endTime: '20:00', slotDurationMinutes: 30, breakDurationMinutes: 0
  })

  useEffect(() => { dispatch(fetchMySalons()) }, [])
  useEffect(() => {
    if (mySalons.length > 0 && !selectedSalonId) setSelectedSalonId(mySalons[0].id)
  }, [mySalons])
  useEffect(() => {
    if (selectedSalonId) {
      salonApi.getBarbers(selectedSalonId).then(r => {
        const arr = r.data.data
        setBarbers((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((b: Barber) => ({ ...b, isAvailable: b.isAvailable ?? (b as Barber & { available?: boolean }).available ?? false })))
      }).catch(() => {})
    }
  }, [selectedSalonId])
  useEffect(() => {
    if (selectedBarberId && selectedDate) {
      slotApi.getAll(selectedBarberId, selectedDate).then(r => {
        const arr = r.data.data
        setSlots((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((s: TimeSlot) => ({ ...s, isBooked: s.isBooked ?? (s as TimeSlot & { booked?: boolean }).booked ?? false, isAvailable: s.isAvailable ?? (s as TimeSlot & { available?: boolean }).available ?? false })))
      }).catch(() => setSlots([]))
    }
  }, [selectedBarberId, selectedDate])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBarberId) { toast.error('Select a barber first'); return }
    setSubmitting(true)
    try {
      await slotApi.generate({ barberId: selectedBarberId, date: selectedDate, ...genForm })
      const res = await slotApi.getAll(selectedBarberId, selectedDate)
      const arr = res.data.data
      setSlots((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((s: TimeSlot) => ({ ...s, isBooked: s.isBooked ?? (s as TimeSlot & { booked?: boolean }).booked ?? false, isAvailable: s.isAvailable ?? (s as TimeSlot & { available?: boolean }).available ?? false })))
      toast.success('Slots generated!')
      setShowModal(false)
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } }
      toast.error(error.response?.data?.message || 'Failed to generate slots')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Sidebar />
      <main className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-60' : 'lg:pl-16'}`}>
        <div className="page-container py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Time Slots</h1>
              <p className="text-slate-400 text-sm mt-1">Generate and manage availability</p>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
              <Plus size={16} /> Generate Slots
            </button>
          </div>

          {/* Filters */}
          <div className="glass-card p-4 rounded-2xl mb-6 flex flex-wrap gap-4">
            {mySalons.length > 1 && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Salon</label>
                <select value={selectedSalonId || ''} onChange={e => setSelectedSalonId(Number(e.target.value))}
                  className="input-field py-2 text-sm">
                  {mySalons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Barber</label>
              <select value={selectedBarberId || ''} onChange={e => setSelectedBarberId(Number(e.target.value))}
                className="input-field py-2 text-sm">
                <option value="">Select barber</option>
                {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Date</label>
              <input type="date" value={selectedDate} min={format(new Date(), 'yyyy-MM-dd')}
                onChange={e => setSelectedDate(e.target.value)} className="input-field py-2 text-sm" />
            </div>
          </div>

          {/* Slots grid */}
          {!selectedBarberId ? (
            <div className="glass-card rounded-2xl p-12 text-center text-slate-500">
              <Clock size={40} className="mx-auto mb-3 opacity-30" />
              Select a barber to view their slots
            </div>
          ) : slots.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <Clock size={40} className="mx-auto text-slate-700 mb-3" />
              <p className="text-white font-medium mb-1">No slots for this date</p>
              <p className="text-slate-500 text-sm mb-5">Generate time slots for the selected barber and date</p>
              <button onClick={() => setShowModal(true)} className="btn-primary px-5 py-2">Generate Slots</button>
            </div>
          ) : (
            <div>
              <p className="text-slate-400 text-sm mb-4">{slots.length} slots for {selectedDate}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {slots.map(slot => (
                  <div key={slot.id}
                    className={`p-2.5 rounded-xl text-center text-xs font-medium border transition-all ${
                      slot.isBooked
                        ? 'bg-primary-600/20 text-primary-400 border-primary-600/30'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                    }`}>
                    <div>{slot.startTime}</div>
                    <div className="text-slate-600 text-xs mt-0.5">{slot.isBooked ? 'Booked' : 'Free'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Generate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md glass-card rounded-2xl border border-white/10 animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-white font-semibold">Generate Time Slots</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleGenerate} className="p-5 space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Barber</label>
                <select value={selectedBarberId || ''} onChange={e => setSelectedBarberId(Number(e.target.value))}
                  className="input-field text-sm" required>
                  <option value="">Select barber</option>
                  {barbers.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Date</label>
                <input type="date" value={selectedDate} min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => setSelectedDate(e.target.value)} className="input-field" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Start Time</label>
                  <input type="time" value={genForm.startTime}
                    onChange={e => setGenForm({ ...genForm, startTime: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">End Time</label>
                  <input type="time" value={genForm.endTime}
                    onChange={e => setGenForm({ ...genForm, endTime: e.target.value })} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Slot Duration (mins)</label>
                  <select value={genForm.slotDurationMinutes}
                    onChange={e => setGenForm({ ...genForm, slotDurationMinutes: Number(e.target.value) })}
                    className="input-field text-sm">
                    {[15, 20, 30, 45, 60, 90].map(m => <option key={m} value={m}>{m} mins</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Break Between (mins)</label>
                  <select value={genForm.breakDurationMinutes}
                    onChange={e => setGenForm({ ...genForm, breakDurationMinutes: Number(e.target.value) })}
                    className="input-field text-sm">
                    {[0, 5, 10, 15].map(m => <option key={m} value={m}>{m} mins</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} /> Generate</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OwnerSlotsPage
