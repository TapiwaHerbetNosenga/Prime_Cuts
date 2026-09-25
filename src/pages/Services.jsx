import { Link } from 'react-router-dom'
import {
  services,
  serviceCategories,
  formatPrice,
  formatDuration,
} from '../data/services'

export default function Services() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Services and pricing</h1>
          <p>Choose a service, then pick your barber, day and time when you book.</p>
        </div>
      </section>

      <div className="container page">
        {serviceCategories.map((category) => (
          <section key={category} className="service-group">
            <h2>{category}</h2>
            <div className="service-grid">
              {services
                .filter((s) => s.category === category)
                .map((s) => (
                  <article key={s.id} className="service-card">
                    <h3>{s.name}</h3>
                    <p>{s.description}</p>
                    <div className="service-meta">
                      <span className="service-price">{formatPrice(s.price)}</span>
                      <span className="service-duration">{formatDuration(s.duration)}</span>
                    </div>
                    <Link to={`/booking?service=${s.id}`} className="btn btn-sm">
                      Book this service
                    </Link>
                  </article>
                ))}
            </div>
          </section>
        ))}
        <p className="service-note">All prices are in South African rand (ZAR).</p>
      </div>
    </>
  )
}