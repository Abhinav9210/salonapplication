import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check, Calendar, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { fetchSalonById } from '../../features/salon/salonSlice'
import { createBooking } from '../../features/booking/bookingSlice'
import {
  setSelectedBarber, setSelectedService, setSelectedSlot,
  nextBookingStep, prevBookingStep, resetBookingFlow
} from '../../features/ui/uiSlice'
import { salonApi } from '../../api/salonApi'
import { slotApi } from '../../api/index'
import type { Barber, SalonService, TimeSlot } from '../../types'
import BarberCard from '../../components/common/BarberCard'
import Navbar from '../../components/layout/Navbar'
import { useParams } from 'react-router-dom'

const STEPS = ['Select Barber', 'Select Service', 'Pick Slot', 'Payment', 'Confirm']

const BookingPage = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { currentSalon } = useAppSelector(s => s.salon)
  const { bookingStep, selectedBarberId, selectedServiceId, selectedSlotId } = useAppSelector(s => s.ui)
  const { loading } = useAppSelector(s => s.booking)
  const { isAuthenticated } = useAppSelector(s => s.auth)

  const [barbers, setBarbers] = useState<Barber[]>([])
  const [services, setServices] = useState<SalonService[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [paymentMode, setPaymentMode] = useState<'ONLINE_FULL' | 'ONLINE_FEE_CASH_REMAINING'>('ONLINE_FEE_CASH_REMAINING')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    dispatch(resetBookingFlow())
    if (id) {
      dispatch(fetchSalonById(Number(id)))
      salonApi.getBarbers(Number(id)).then(r => {
        const arr = r.data.data
        setBarbers((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((b: Barber) => ({ ...b, isAvailable: b.isAvailable ?? (b as Barber & { available?: boolean }).available ?? false })))
      })
      salonApi.getServices(Number(id)).then(r => {
        const arr = r.data.data
        setServices((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((s: SalonService) => ({ ...s, isActive: s.isActive ?? (s as SalonService & { active?: boolean }).active ?? false })))
      })
    }
    if (!isAuthenticated) navigate('/login', { state: { from: { pathname: `/salons/${id}/book` } } })
  }, [id, isAuthenticated])

  useEffect(() => {
    if (selectedBarberId && selectedDate) {
      slotApi.getAvailable(selectedBarberId, selectedDate).then(r => {
        const arr = r.data.data
        setSlots((Array.isArray(arr) ? arr : (arr?.content ?? [])).map((s: TimeSlot) => ({ ...s, isBooked: s.isBooked ?? (s as TimeSlot & { booked?: boolean }).booked ?? false, isAvailable: s.isAvailable ?? (s as TimeSlot & { available?: boolean }).available ?? false })))
      })
    }
  }, [selectedBarberId, selectedDate])

  const selectedBarber = barbers.find(b => b.id === selectedBarberId)
  const selectedService = services.find(s => s.id === selectedServiceId)
  const selectedSlot = slots.find(s => s.id === selectedSlotId)

  const handleConfirmBooking = async () => {
    if (!selectedBarberId || !selectedServiceId || !selectedSlotId || !id) return
    const res = await dispatch(createBooking({
      salonId: Number(id),
      barberId: selectedBarberId,
      serviceId: selectedServiceId,
      slotId: selectedSlotId,
      paymentMode,
      notes,
    }))
    if (createBooking.fulfilled.match(res)) {
      navigate('/dashboard/customer/bookings')
    }
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <div className="pt-24 pb-16 page-container">
        <div className="max-w-2xl mx-auto">
          {/* Progress Steps Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                    i < bookingStep ? 'bg-primary-600 text-white shadow-glow' :
                    i === bookingStep ? 'bg-primary-600/30 text-primary-300 border border-primary-500 ring-2 ring-primary-500/20' :
                    'bg-dark-700 text-slate-500'
                  }`}>
                    {i < bookingStep ? <Check size={13} /> : i + 1}
                  </div>
                  <span className={`text-xs ml-1.5 hidden md:block whitespace-nowrap ${i === bookingStep ? 'text-primary-300 font-semibold' : 'text-slate-500'}`}>
                    {step}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1.5 sm:mx-2 rounded-full transition-colors ${i < bookingStep ? 'bg-primary-600' : 'bg-white/10'}`} />
                  )}
                </div>
              ))}
            </div>
            {/* Mobile current step indicator subtitle */}
            <div className="mt-3 text-center md:hidden">
              <span className="text-xs text-primary-400 font-semibold tracking-wide">
                Step {bookingStep + 1} of {STEPS.length}: {STEPS[bookingStep]}
              </span>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 sm:p-6 min-h-[400px]">
            {/* Step 0: Select Barber */}
            {bookingStep === 0 && (
              <div>
                <h2 className="section-title text-xl sm:text-2xl mb-4">Choose Your Barber</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {barbers.filter(b => b.isAvailable).map(b => (
                    <BarberCard key={b.id} barber={b}
                      selected={selectedBarberId === b.id}
                      onSelect={() => dispatch(setSelectedBarber(b.id))} />
                  ))}
                  {barbers.filter(b => b.isAvailable).length === 0 && (
                    <p className="text-slate-500 text-sm col-span-2 text-center py-8">No barbers available at the moment.</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Select Service */}
            {bookingStep === 1 && (
              <div>
                <h2 className="section-title text-xl sm:text-2xl mb-4">Choose a Service</h2>
                <div className="space-y-3">
                  {services.map(s => (
                    <div key={s.id} onClick={() => dispatch(setSelectedService(s.id))}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedServiceId === s.id
                          ? 'border-primary-500 bg-primary-600/10 shadow-glow'
                          : 'border-white/5 hover:border-white/15 glass-card active:scale-[0.99]'
                      }`}>
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm sm:text-base">{s.name}</p>
                          {s.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{s.description}</p>}
                          <p className="text-xs text-slate-400 mt-1">{s.durationMinutes} minutes</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <p className="text-base sm:text-lg font-bold text-white">₹{s.price}</p>
                          {selectedServiceId === s.id && <Check size={18} className="text-primary-400" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Pick Slot */}
            {bookingStep === 2 && (
              <div>
                <h2 className="section-title text-xl sm:text-2xl mb-4">Pick a Time Slot</h2>
                <input type="date" value={selectedDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="input-field mb-4" />
                {slots.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    <Calendar size={40} className="mx-auto mb-2 opacity-30" />
                    No available slots for this date
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {slots.map(slot => (
                      <button key={slot.id} onClick={() => dispatch(setSelectedSlot(slot.id))}
                        className={`p-3 rounded-xl text-center text-xs font-semibold transition-all min-h-[44px] flex items-center justify-center ${
                          selectedSlotId === slot.id
                            ? 'bg-primary-600 text-white border border-primary-500 shadow-glow'
                            : 'bg-dark-700 text-slate-300 border border-white/5 hover:border-primary-600/40 active:scale-95'
                        }`}>
                        {slot.startTime} – {slot.endTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Payment */}
            {bookingStep === 3 && (
              <div>
                <h2 className="section-title text-xl sm:text-2xl mb-4">Payment Mode</h2>
                <div className="space-y-3 mb-6">
                  {[
                    { value: 'ONLINE_FEE_CASH_REMAINING', label: '💳 Pay Booking Fee Online', desc: `Pay ₹${currentSalon?.minimumBookingFee} now, rest at salon` },
                    { value: 'ONLINE_FULL', label: '✅ Pay Full Amount Online', desc: `Pay ₹${selectedService?.price} now` },
                  ].map(opt => (
                    <div key={opt.value} onClick={() => setPaymentMode(opt.value as typeof paymentMode)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMode === opt.value
                          ? 'border-primary-500 bg-primary-600/10'
                          : 'border-white/5 glass-card hover:border-white/15'
                      }`}>
                      <p className={`font-semibold text-sm ${paymentMode === opt.value ? 'text-primary-300' : 'text-white'}`}>{opt.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-medium mb-1.5 block">Special Note (optional)</label>
                  <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Any special requests..."
                    className="input-field resize-none" />
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {bookingStep === 4 && (
              <div>
                <h2 className="section-title text-xl sm:text-2xl mb-6">Confirm Your Booking</h2>
                <div className="space-y-3">
                  {[
                    ['Salon', currentSalon?.name],
                    ['Barber', selectedBarber?.name],
                    ['Service', `${selectedService?.name} — ₹${selectedService?.price}`],
                    ['Date', selectedDate],
                    ['Time', `${selectedSlot?.startTime} – ${selectedSlot?.endTime}`],
                    ['Payment', paymentMode === 'ONLINE_FULL' ? 'Full Online' : `₹${currentSalon?.minimumBookingFee} now + rest at salon`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-col xs:flex-row xs:items-center justify-between py-2.5 border-b border-white/5 text-sm gap-1">
                      <span className="text-slate-400 text-xs sm:text-sm">{label}</span>
                      <span className="text-white font-medium text-left xs:text-right">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-primary-600/10 border border-primary-600/25 text-xs text-slate-300 leading-relaxed">
                  By confirming, you agree to the booking terms. Your slot will be held for 30 minutes pending salon approval.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5 gap-3">
              <button onClick={() => dispatch(prevBookingStep())}
                disabled={bookingStep === 0}
                className="btn-secondary py-2.5 px-4 sm:px-5 text-sm flex items-center gap-1.5 disabled:opacity-40 min-h-[44px]">
                <ChevronLeft size={16} /> Back
              </button>

              {bookingStep < STEPS.length - 1 ? (
                <button
                  onClick={() => dispatch(nextBookingStep())}
                  disabled={
                    (bookingStep === 0 && !selectedBarberId) ||
                    (bookingStep === 1 && !selectedServiceId) ||
                    (bookingStep === 2 && !selectedSlotId)
                  }
                  className="btn-primary py-2.5 px-5 sm:px-6 text-sm flex items-center gap-1.5 disabled:opacity-40 min-h-[44px]">
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleConfirmBooking} disabled={loading}
                  className="btn-primary py-2.5 px-5 sm:px-6 text-sm flex items-center gap-2 min-h-[44px]">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Check size={16} /> Confirm Booking</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
