import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/logos/dark_big_logo.svg'
import { shopInfo } from '../data/shopInfo'

export default function Footer() {
  const { name, tagline, address, phone, email, hours, social } = shopInfo
  const location = useLocation()
  const navigate = useNavigate()

  function handleBookingLink(e) {
    if (location.pathname === '/booking') {
      e.preventDefault()
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
      return
    }

    navigate('/booking')
  }

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <img src={logo} alt={`${name} Barbers`} className="footer-logo" />
          <p>{tagline}</p>
        </div>

        <nav aria-label="Footer">
          <h2>Explore</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/booking" onClick={handleBookingLink}>Contact</Link></li>
            <li><Link to="/booking" onClick={handleBookingLink}>Book an appointment</Link></li>
          </ul>
        </nav>

        <div>
          <h2>Contact</h2>
          <address>
            {address.street}<br />
            {address.city}, {address.postalCode}<br />
            <a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a><br />
            <a href={`mailto:${email}`}>{email}</a>
          </address>
        </div>

        <div>
          <h2>Opening hours</h2>
          <ul className="hours">
            {hours.map((h) => (
              <li key={h.day}>
                <span>{h.day}</span>
                <span>{h.open ? `${h.open} to ${h.close}` : 'Closed'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <ul className="social">
          {social.map((s) => (
            <li key={s.name}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
            </li>
          ))}
        </ul>
        <Link to="/terms">Terms &amp; Conditions</Link>
        <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
      </div>
    </footer>
  )
}