import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { shopInfo } from '../data/shopInfo'
import { services } from '../data/services'
import { barbers } from '../data/barbers'
import { generateSlots, nextDays, formatDateForId } from '../lib/slots'
import { submitBooking } from '../lib/bookings'
import { downloadICS, googleCalendarUrl } from '../lib/calendar'

const STEPS = ['Service', 'Barber', 'Date & Time', 'Your details', 'Confirm']

export default function Booking() {
  const [searchParams] = useSearchParams()
  const preselectedService = searchParams.get('service')

  // --- Step / selection state ---
  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState(preselectedService || '')
  const [barberId, setBarberId] = useState('any')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')

  // --- Customer details + submission state ---
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // If a service was pre-selected via the Services page, skip straight to Barber
  useEffect(() => {
    if (preselectedService && services.some((s) => s.id === preselectedService)) {
      setStep(1)
    }
  }, [preselectedService])

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
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong. Please try a different time.')
    } finally {
      setSubmitting(false)
    }
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
            <a href={`tel:${shopInfo.phone.replace(/\s/g, '')}`}>{shopInfo.phone}</a><br />
            <a href={`mailto:${shopInfo.email}`}>{shopInfo.email}</a>
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

        <div className="booking-form-shell">
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
                  {availableTimes.map((t) => (
                    <button
                      type="button"
                      key={t}
                      className={`time-chip ${selectedTime === t ? 'selected' : ''}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  ))}
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
                  <input type="text" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} required />
                </label>
                <label>
                  Email
                  <input type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} required />
                </label>
                <label>
                  Phone
                  <input type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
                </label>
                <label>
                  Notes (optional)
                  <textarea rows="3" value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} />
                </label>
              </div>
              <div className="step-actions">
                <button type="button" className="btn btn-outline-dark" onClick={goBack}>Back</button>
                <button
                  type="button"
                  className="btn"
                  disabled={!customer.name || !customer.email}
                  onClick={goNext}
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
                    <button type="button" className="btn" onClick={handleConfirm} disabled={submitting}>
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
                          date: selectedDate.toISOString().slice(0, 10),
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
                        date: selectedDate.toISOString().slice(0, 10),
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
    </>
  )
}