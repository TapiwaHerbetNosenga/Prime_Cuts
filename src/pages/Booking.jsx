import { shopInfo } from '../data/shopInfo'

export default function Booking() {
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

          <div className="map-placeholder" role="img" aria-label={`Map location for ${shopInfo.name} at ${shopInfo.address.street}`}>
            Map coming soon
          </div>
        </div>

        <div className="booking-form-shell">
          <h2>Book your visit</h2>
          <p className="booking-note">Booking form is being finalised — check back shortly.</p>

          <form className="booking-form" aria-disabled="true">
            <label>
              Service
              <select disabled>
                <option>Choose a service</option>
              </select>
            </label>
            <label>
              Barber
              <select disabled>
                <option>Any barber</option>
              </select>
            </label>
            <label>
              Date
              <input type="date" disabled />
            </label>
            <label>
              Time
              <select disabled>
                <option>Choose a time</option>
              </select>
            </label>
            <label>
              Full name
              <input type="text" disabled placeholder="Your name" />
            </label>
            <label>
              Email
              <input type="email" disabled placeholder="you@example.com" />
            </label>
            <button type="button" className="btn" disabled>Continue</button>
          </form>
        </div>
      </div>
    </>
  )
}