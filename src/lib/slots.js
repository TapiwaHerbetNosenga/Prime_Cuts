import { shopInfo } from '../data/shopInfo'

// Turn "09:00" into 540 (minutes since midnight)
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHHMM(mins) {
  const h = String(Math.floor(mins / 60)).padStart(2, '0')
  const m = String(mins % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Given a JS Date, return that day's hours entry from shopInfo
export function hoursForDate(date) {
  const jsDay = date.getDay() // 0 = Sunday
  const index = (jsDay + 6) % 7 // shopInfo.hours is Monday-first
  return shopInfo.hours[index]
}

// Generate time slots for a given date and service duration, in 15-minute steps
export function generateSlots(date, durationMinutes) {
  const hours = hoursForDate(date)
  if (!hours.open) return []

  const open = toMinutes(hours.open)
  const close = toMinutes(hours.close)
  const slots = []

  const now = new Date()
  const isToday = formatDateForId(date) === formatDateForId(now)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  for (let start = open; start + durationMinutes <= close; start += 15) {
    if (isToday && start <= nowMinutes) continue
    slots.push(toHHMM(start))
  }
  return slots
}

export function formatDateForId(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function slotId(date, time, barberId) {
  return `${formatDateForId(date)}_${time.replace(':', '')}_${barberId}`
}

// Next 14 days, skipping none (closed days are just shown as unavailable in the picker)
export function nextDays(count = 14) {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

export function occupiedSlotTimes(startTime, durationMinutes) {
  const [h, m] = startTime.split(':').map(Number)
  const startMin = h * 60 + m
  const times = []
  for (let t = startMin; t < startMin + durationMinutes; t += 15) {
    times.push(toHHMM(t))
  }
  return times
}