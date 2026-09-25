import { runTransaction, doc, addDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import { slotId, formatDateForId, occupiedSlotTimes } from './slots'
import { barbers } from '../data/barbers'

async function claimSlotRangeTransactionally(date, startTime, durationMinutes, barberId) {
  const times = occupiedSlotTimes(startTime, durationMinutes)
  const refs = times.map((t) => doc(db, 'slots', slotId(date, t, barberId)))

  await runTransaction(db, async (transaction) => {
    // Check every slot in the range first
    for (const ref of refs) {
      const snap = await transaction.get(ref)
      if (snap.exists()) {
        throw new Error('SLOT_TAKEN')
      }
    }
    // Only claim them all if every single one was free
    refs.forEach((ref, i) => {
      transaction.set(ref, {
        taken: true,
        barberId,
        date: formatDateForId(date),
        time: times[i],
      })
    })
  })
}

export async function submitBooking({ service, barberId, date, time, customer }) {
  let finalBarberId = barberId

  if (barberId === 'any') {
    let claimed = false
    for (const b of barbers) {
      try {
        await claimSlotRangeTransactionally(date, time, service.duration, b.id)
        finalBarberId = b.id
        claimed = true
        break
      } catch (err) {
        if (err.message !== 'SLOT_TAKEN') throw err
      }
    }
    if (!claimed) throw new Error('No barbers available at that time. Please pick another slot.')
  } else {
    await claimSlotRangeTransactionally(date, time, service.duration, barberId)
  }

  const barber = barbers.find((b) => b.id === finalBarberId)

  const bookingRef = await addDoc(collection(db, 'bookings'), {
    serviceId: service.id,
    serviceName: service.name,
    price: service.price,
    duration: service.duration,
    barberId: finalBarberId,
    barberName: barber.name,
    date: formatDateForId(date),
    time,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone || '',
    notes: customer.notes || '',
    createdAt: serverTimestamp(),
  })

  return { bookingId: bookingRef.id, barberName: barber.name }
}

export async function getTakenSlotsForDate(date) {
  const dateId = formatDateForId(date)
  const q = query(collection(db, 'slots'), where('date', '==', dateId))
  const snap = await getDocs(q)

  const taken = {}
  snap.forEach((doc) => {
    const { time, barberId } = doc.data()
    if (!taken[time]) taken[time] = new Set()
    taken[time].add(barberId)
  })
  return taken
}