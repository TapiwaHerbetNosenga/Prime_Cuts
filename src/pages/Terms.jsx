import { shopInfo } from '../data/shopInfo'

export default function Terms() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>Terms & Conditions</h1>
          <p>Please read these terms before booking an appointment with {shopInfo.name}.</p>
        </div>
      </section>

      <div className="container page legal-content">
        <p><em>Last updated: {new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long' })}</em></p>

        <h2>1. Bookings</h2>
        <p>
          Appointments can be booked online through our booking page. Please arrive
          on time for your appointment. Arriving more than 10 minutes late may
          result in a shortened service or a request to rebook, depending on
          availability.
        </p>

        <h2>2. Cancellations and rescheduling</h2>
        <p>
          We ask that you cancel or reschedule at least 4 hours before your
          appointment where possible. This gives us a chance to offer the slot
          to another customer. Repeated late cancellations or no-shows may
          affect your ability to book online in future.
        </p>

        <h2>3. Pricing</h2>
        <p>
          Prices for all services are listed on our Services page and are shown
          in South African rand. Prices may change from time to time; the price
          shown at the time of booking is the price that applies to that
          appointment.
        </p>

        <h2>4. Age and consent</h2>
        <p>
          Clients under the age of 16 should be accompanied by a parent or
          guardian. Kids' cuts are available for children under 12.
        </p>

        <h2>5. Conduct</h2>
        <p>
          We ask all clients to treat our barbers and other customers with
          respect. We reserve the right to decline service to anyone behaving
          in an abusive, threatening or unsafe manner.
        </p>

        <h2>6. Results and satisfaction</h2>
        <p>
          We aim to deliver the cut or service discussed with your barber
          before starting. If you are not happy with the result, please raise
          it with us before leaving the shop so we can make it right.
        </p>

        <h2>7. Liability</h2>
        <p>
          While every care is taken during services such as shaves and beard
          trims, {shopInfo.name} is not liable for reactions to products
          unless a known allergy or sensitivity was disclosed to your barber
          in advance. Please tell us about any skin conditions or allergies
          before your service begins.
        </p>

        <h2>8. Calendar and booking data</h2>
        <p>
          When you book an appointment, we store the details you provide
          (name, contact details, and the service, barber, date and time
          selected) in order to manage the booking. This information is used
          only to provide and manage your appointment.
        </p>

        <h2>9. Changes to these terms</h2>
        <p>
          These terms may be updated from time to time. The version on this
          page at the time of your booking applies to that appointment.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about these terms can be sent to{' '}
          <a href={`mailto:${shopInfo.emailHref}`}>{shopInfo.email}</a> or by
          calling <a href={`tel:${shopInfo.phoneHref}`}>{shopInfo.phone}</a>.
        </p>

        <p className="legal-disclaimer">
          This is a demonstration website built for a development assessment.
          {shopInfo.name} is a fictional business, and these terms are
          illustrative rather than a reviewed legal document.
        </p>
      </div>
    </>
  )
}