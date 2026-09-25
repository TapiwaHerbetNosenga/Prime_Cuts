import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { shopInfo } from '../data/shopInfo'
import { services } from '../data/services'
import { barbers } from '../data/barbers'
import { generateSlots, nextDays, formatDateForId } from '../lib/slots'
import { submitBooking } from '../lib/bookings'
import { downloadICS, googleCalendarUrl } from '../lib/calendar'
import BookingSuccessModal from '../components/BookingSuccessModal'
import { getTakenSlotsForDate } from '../lib/bookings'

const STEPS = ['Service', 'Barber', 'Date & Time', 'Your details', 'Confirm']

export default function Booking() {
  const [searchParams] = useSearchParams()
  const preselectedService = searchParams.get('service')
  const preselectedBarber = searchParams.get('barber')
  const bookingFormRef = useRef(null)

  // --- Step / selection state ---
  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState(preselectedService || '')
  const [barberId, setBarberId] = useState(preselectedBarber || 'any')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')

  // --- Customer details + submission state ---
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', notes: '' })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // --- Success modal state ---
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // --- Taken slots state (for disabling already booked times) ---
const [takenSlots, setTakenSlots] = useState({})

  // If a service or barber was pre-selected via a CTA, skip straight to the relevant step
  useEffect(() => {
    if (preselectedService && services.some((s) => s.id === preselectedService)) {
      setServiceId(preselectedService)
      setStep(1)
    }

    if (preselectedBarber && barbers.some((b) => b.id === preselectedBarber)) {
      setBarberId(preselectedBarber)
    }
  }, [preselectedService, preselectedBarber])

  // Whenever the selected date changes, fetch the taken slots for that date
  useEffect(() => {
  if (!selectedDate) return
  let cancelled = false
  getTakenSlotsForDate(selectedDate).then((result) => {
    if (!cancelled) setTakenSlots(result)
  })
  return () => { cancelled = true }
}, [selectedDate])

  useEffect(() => {
    if (!bookingFormRef.current) return

    const mobile = window.innerWidth < 860
    bookingFormRef.current.scrollIntoView({
      behavior: 'smooth',
      block: mobile ? 'center' : 'start',
    })
  }, [step])

  // --- Derived values ---
  const service = services.find((s) => s.id === serviceId)
  const days = useMemo(() => nextDays(14), [])
  const availableTimes = useMemo(
    () => (selectedDate && service ? generateSlots(selectedDate, service.duration) : []),
    [selectedDate, service]
  )

  // --- Handlers ---
  function goNext() { setStep((s) => Math.min(s + 1, STEPS.length - 1)) }
  function goBack() { setStep((s) => Math.max(s - 1, 0)) }

  async function handleConfirm() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await submitBooking({ service, barberId, date: selectedDate, time: selectedTime, customer })
      setConfirmedBooking(result)
      setShowSuccessModal(true)
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try a different time.')
    } finally {
      setSubmitting(false)
    }
  }

  function isTimeTaken(time, barberId, takenSlots) {
    const takenBarbers = takenSlots[time]
    if (!takenBarbers) return false
    if (barberId === 'any') {
      return barbers.every((b) => takenBarbers.has(b.id))
    }
    return takenBarbers.has(barberId)
  }

  function validateCustomerDetails(data) {
    const errors = {}
    const name = data.name.trim()
    const email = data.email.trim()
    const phone = data.phone.trim()

    if (!name) {
      errors.name = 'Please enter your full name.'
    }

    if (!email) {
      errors.email = 'Please enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (phone && !/^[0-9+()\s-]{7,}$/.test(phone)) {
      errors.phone = 'Please enter a valid phone number.'
    }

    return errors
  }

  function handleCustomerChange(field, value) {
    const nextCustomer = { ...customer, [field]: value }
    setCustomer(nextCustomer)

    setFormErrors((current) => {
      if (!current[field]) return current
      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  function handleReviewBooking() {
    const nextErrors = validateCustomerDetails(customer)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length === 0) {
      goNext()
    }
  }

  async function handleConfirmClick() {
    const nextErrors = validateCustomerDetails(customer)
    setFormErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    await handleConfirm()
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Book an appointment</h1>
          <p>Choose your service, pick a time that works, and we'll see you in the chair.</p>
        </div>
      </section>

      <div className="container page booking-layout">
        <div className="booking-info">
          <h2>Visit us</h2>
          <address>
            {shopInfo.address.street}<br />
            {shopInfo.address.city}, {shopInfo.address.postalCode}
          </address>
          <p>
            <a href={`tel:${shopInfo.phoneHref}`}>{shopInfo.phone}</a><br />
            <a href={`mailto:${shopInfo.emailHref}`}>{shopInfo.email}</a>
          </p>
          <h2>Opening hours</h2>
          <ul className="hours">
            {shopInfo.hours.map((h) => (
              <li key={h.day}>
                <span>{h.day}</span>
                <span>{h.open ? `${h.open} to ${h.close}` : 'Closed'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="booking-form-shell" ref={bookingFormRef}>
          <ol className="booking-progress" aria-label="Booking steps">
            {STEPS.map((label, i) => (
              <li key={label} className={i === step ? 'active' : i < step ? 'done' : ''}>
                {label}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <fieldset>
              <legend>Choose a service</legend>
              <div className="option-grid">
                {services.map((s) => (
                  <label key={s.id} className={`option-card ${serviceId === s.id ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="service"
                      value={s.id}
                      checked={serviceId === s.id}
                      onChange={() => setServiceId(s.id)}
                    />
                    <span className="option-title">{s.name}</span>
                    <span className="option-meta">R{s.price} · {s.duration} min</span>
                  </label>
                ))}
              </div>
              <button type="button" className="btn" disabled={!serviceId} onClick={goNext}>
                Continue
              </button>
            </fieldset>
          )}

          {step === 1 && (
            <fieldset>
              <legend>Choose a barber</legend>
              <div className="option-grid">
                <label className={`option-card ${barberId === 'any' ? 'selected' : ''}`}>
                  <input type="radio" name="barber" value="any" checked={barberId === 'any'} onChange={() => setBarberId('any')} />
                  <span className="option-title">Any barber</span>
                  <span className="option-meta">First available</span>
                </label>
                {barbers.map((b) => (
                  <label key={b.id} className={`option-card ${barberId === b.id ? 'selected' : ''}`}>
                    <input type="radio" name="barber" value={b.id} checked={barberId === b.id} onChange={() => setBarberId(b.id)} />
                    <span className="option-title">{b.name}</span>
                    <span className="option-meta">{b.role}</span>
                  </label>
                ))}
              </div>
              <div className="step-actions">
                <button type="button" className="btn btn-outline-dark" onClick={goBack}>Back</button>
                <button type="button" className="btn" onClick={goNext}>Continue</button>
              </div>
            </fieldset>
          )}

          {step === 2 && (
            <fieldset>
              <legend>Choose a date and time</legend>
              <div className="day-scroll">
                {days.map((d) => {
                  const closed = generateSlots(d, service?.duration || 30).length === 0
                  const isSelected = selectedDate && formatDateForId(d) === formatDateForId(selectedDate)
                  return (
                    <button
                      type="button"
                      key={formatDateForId(d)}
                      className={`day-chip ${isSelected ? 'selected' : ''}`}
                      disabled={closed}
                      onClick={() => { setSelectedDate(d); setSelectedTime('') }}
                    >
                      <span>{d.toLocaleDateString('en-ZA', { weekday: 'short' })}</span>
                      <strong>{d.getDate()}</strong>
                    </button>
                  )
                })}
              </div>

              {selectedDate && (
  <div className="time-grid">
    {availableTimes.length === 0 && <p>No times available that day.</p>}
    {availableTimes.map((t) => {
      const taken = isTimeTaken(t, barberId, takenSlots)
      return (
        <button
          type="button"
          key={t}
          className={`time-chip ${selectedTime === t ? 'selected' : ''} ${taken ? 'taken' : ''}`}
          disabled={taken}
          onClick={() => setSelectedTime(t)}
        >
          {t}
        </button>
      )
    })}
  </div>
)}
              <div className="step-actions">
                <button type="button" className="btn btn-outline-dark" onClick={goBack}>Back</button>
                <button type="button" className="btn" disabled={!selectedTime} onClick={goNext}>Continue</button>
              </div>
            </fieldset>
          )}

          {step === 3 && (
            <fieldset>
              <legend>Your details</legend>
              <div className="detail-fields">
                <label>
                  Full name
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                    required
                  />
                  {formErrors.name && <small className="form-error">{formErrors.name}</small>}
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    required
                  />
                  {formErrors.email && <small className="form-error">{formErrors.email}</small>}
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                  />
                  {formErrors.phone && <small className="form-error">{formErrors.phone}</small>}
                </label>
                <label>
                  Notes (optional)
                  <textarea rows="3" value={customer.notes} onChange={(e) => handleCustomerChange('notes', e.target.value)} />
                </label>
              </div>
              <div className="step-actions">
                <button type="button" className="btn btn-outline-dark" onClick={goBack}>Back</button>
                <button
                  type="button"
                  className="btn"
                  disabled={submitting}
                  onClick={handleReviewBooking}
                >
                  Review booking
                </button>
              </div>
            </fieldset>
          )}

          {step === 4 && (
            <fieldset>
              <legend>Confirm your booking</legend>
              {!confirmedBooking ? (
                <>
                  <dl className="summary-list">
                    <div><dt>Service</dt><dd>{service?.name}</dd></div>
                    <div><dt>Barber</dt><dd>{barberId === 'any' ? 'Any available barber' : barbers.find((b) => b.id === barberId)?.name}</dd></div>
                    <div><dt>Date</dt><dd>{selectedDate?.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</dd></div>
                    <div><dt>Time</dt><dd>{selectedTime}</dd></div>
                    <div><dt>Price</dt><dd>R{service?.price}</dd></div>
                    <div><dt>Name</dt><dd>{customer.name}</dd></div>
                    <div><dt>Email</dt><dd>{customer.email}</dd></div>
                  </dl>

                  {submitError && <p className="form-error">{submitError}</p>}

                  <div className="step-actions">
                    <button type="button" className="btn btn-outline-dark" onClick={goBack} disabled={submitting}>Back</button>
                    <button type="button" className="btn" onClick={handleConfirmClick} disabled={submitting}>
                      {submitting ? 'Booking...' : 'Confirm booking'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="booking-success">
                  <h3>You're booked, {customer.name.split(' ')[0]}!</h3>
                  <p>
                    {service?.name} with {confirmedBooking.barberName} on{' '}
                    {selectedDate?.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })} at {selectedTime}.
                  </p>
                  <div className="calendar-actions">
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() =>
                        downloadICS({
                          serviceName: service.name,
                          barberName: confirmedBooking.barberName,
                          date: formatDateForId(selectedDate),
                          time: selectedTime,
                          duration: service.duration,
                        })
                      }
                    >
                      Add to Apple/Outlook Calendar
                    </button>
                    <a
                      className="btn btn-sm btn-outline-dark"
                      href={googleCalendarUrl({
                        serviceName: service.name,
                        barberName: confirmedBooking.barberName,
                        date: formatDateForId(selectedDate),
                        time: selectedTime,
                        duration: service.duration,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Add to Google Calendar
                    </a>
                  </div>
                </div>
              )}
            </fieldset>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <BookingSuccessModal
          customerFirstName={customer.name.split(' ')[0]}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </>
  )
}