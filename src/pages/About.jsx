import { Link } from 'react-router-dom'
import { barbers } from '../data/barbers'
import { shopInfo } from '../data/shopInfo'
import storyImg from '../assets/images/barber_working_1.webp'
import atWorkImg from '../assets/images/barber_working_2.webp'
import barberProfile1 from '../assets/images/barber_profile_1.webp'
import barberProfile2 from '../assets/images/barber_profile_2.webp'
import barberProfile3 from '../assets/images/barber_profile_3.webp'

const barberPhotos = {
  thabo: barberProfile1,
  ryan: barberProfile2,
 damian : barberProfile3,
}

function initials(name) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2)
}

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>About {shopInfo.name}</h1>
          <p>{shopInfo.tagline}</p>
        </div>
      </section>

      <section className="split-section">
        <img src={storyImg} alt="A barber at work in the Prime Cuts shop"  className="crop-top" />
        <div className="split-content">
          <h2>Our story</h2>
          <p>
            {shopInfo.name} started as a small chair in Somerset West and grew
            into a full shop built around one idea: a proper cut, done properly,
            every time. No rushed appointments, no guesswork on price.
          </p>
          <p>
            Today the team works across classic cuts, fades, and traditional
            hot towel shaves, with every barber bringing their own focus to
            the chair.
          </p>
        </div>
      </section>

      <section className="container page">
        <div className="section-heading">
          <h2>Meet the barbers</h2>
        </div>
        <div className="barber-grid">
          {barbers.map((b) => (
            <article key={b.id} className="barber-card">
              {barberPhotos[b.id] ? (
                <img src={barberPhotos[b.id]} alt={b.name} className="barber-photo" />
              ) : (
                <div className="barber-avatar" aria-hidden="true">{initials(b.name)}</div>
              )}
              <h3>{b.name}</h3>
              <p className="barber-role">{b.role}</p>
              <p>{b.bio}</p>
              <ul className="barber-tags">
                {b.specialties.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section reverse">
        <img src={atWorkImg} alt="A barber giving a fade at Prime Cuts" />
        <div className="split-content">
          <h2>Why people choose us</h2>
          <ul className="reasons-list">
            <li>Consistent, well-finished cuts every visit</li>
            <li>Clear, upfront pricing with no surprises</li>
            <li>A relaxed shop that still runs on time</li>
          </ul>
          <Link to="/booking" className="btn btn-sm">Book an appointment</Link>
        </div>
      </section>
    </>
  )
}