import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import Booking from './pages/Booking'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'
import { collection, addDoc } from 'firebase/firestore'
import { db } from './lib/firebase'

async function test() {
  const ref = await addDoc(collection(db, 'bookings'), {
    serviceId: 'test', serviceName: 'Test', price: 0, duration: 0,
    barberId: 'test', barberName: 'Test',
    date: '2026-01-01', time: '10:00',
    customerName: 'Test User', customerEmail: 'test@example.com',
    createdAt: new Date().toISOString(),
  })
  console.log('Written with id', ref.id)
}
test()

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}