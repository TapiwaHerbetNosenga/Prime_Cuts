import { Link } from 'react-router-dom'
import { services, formatPrice, formatDuration } from '../data/services'
import { barbers } from '../data/barbers'
import { shopInfo } from '../data/shopInfo'
import heroImg from '../assets/images/hero.webp'
import shopImg from '../assets/images/inside_shot.webp'

const featuredIds = ['skin-fade', 'cut-and-beard', 'hot-towel-shave', 'kids-cut']
const featured = featuredIds
  .map((id) => services.find((s) => s.id === id))
  .filter(Boolean)

const todayIndex = new Date().getDay()
const orderedHours = [...shopInfo.hours.slice(1), shopInfo.hours[0]] // Mon-first list, Sun last
const today = shopInfo.hours[(todayIndex + 6) % 7]

export default function Home() {
  return (
    <>
      <section className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-overlay">
          <div className="container hero-content">
            <h1>Sharp cuts. Straightforward service.</h1>
            <p>{shopInfo.tagline}</p>
            <div className="hero-actions">
              <Link to="/booking" className="btn">Book Now</Link>
              <Link to="/services" className="btn btn-outline">View Services</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container highlights">
        <div className="highlight">
          <h2>Walk-ins and bookings</h2>
          <p>Book online in a couple of minutes, or check availability for a walk-in.</p>
        </div>
        <div className="highlight">
          <h2>Experienced barbers</h2>
          <p>Every cut is done by a barber who specialises in it, from fades to straight-razor shaves.</p>
        </div>
        <div className="highlight">
          <h2>Straightforward pricing</h2>
          <p>Every price is listed upfront. No guessing what a cut will cost.</p>
        </div>
      </section>

      <section className="container page">
        <div className="section-heading">
          <h2>Popular services</h2>
          <Link to="/services">See all services</Link>
        </div>
        <div className="service-grid">
          {featured.map((s) => (
            <article key={s.id} className="service-card">
              <h3>{s.name}</h3>
              <p>{s.description}</p>
              <div className="service-meta">
                <span className="service-price">{formatPrice(s.price)}</span>
                <span className="service-duration">{formatDuration(s.duration)}</span>
              </div>
              <Link to={`/booking?service=${s.id}`} className="btn btn-sm">Book this service</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section">
        <img src={shopImg} alt="Inside the Prime Cuts barber shop" />
        <div className="split-content">
          <h2>Meet the team</h2>
          <p>
            {barbers.length} barbers, each with their own focus, from precision fades to
            traditional hot towel shaves.
          </p>
          <ul className="barber-list">
            {barbers.map((b) => (
              <li key={b.id}>
                <strong>{b.name}</strong> — {b.role}
              </li>
            ))}
          </ul>
          <Link to="/about" className="btn btn-sm">Meet the barbers</Link>
        </div>
      </section>

      <section className="container page hours-location">
        <div>
          <h2>Today's hours</h2>
          <p>{today.open ? `${today.day}: ${today.open} to ${today.close}` : `${today.day}: Closed`}</p>
          <Link to="/booking">See full hours and location</Link>
        </div>
        <div>
          <h2>Find us</h2>
          <p>
            {shopInfo.address.street}<br />
            {shopInfo.address.city}, {shopInfo.address.postalCode}
          </p>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>Ready for a fresh cut?</h2>
          <Link to="/booking" className="btn">Book your appointment</Link>
        </div>
      </section>
    </>
  )
}