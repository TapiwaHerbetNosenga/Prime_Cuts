import { shopInfo } from '../data/shopInfo'

const SAST_OFFSET_HOURS = 2 // Africa/Johannesburg, fixed year-round, no DST

// dateStr like "2026-09-29", time like "09:30". Returns "20260929T073000Z" (UTC)
function toICSDateTime(dateStr, time) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day, hours - SAST_OFFSET_HOURS, minutes, 0))
  return utc.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function addMinutes(isoBasic, minutesToAdd) {
  const y = isoBasic.slice(0, 4)
  const mo = isoBasic.slice(4, 6)
  const d = isoBasic.slice(6, 8)
  const h = isoBasic.slice(9, 11)
  const mi = isoBasic.slice(11, 13)
  const s = isoBasic.slice(13, 15)
  const dt = new Date(Date.UTC(y, mo - 1, d, h, mi, s))
  dt.setUTCMinutes(dt.getUTCMinutes() + minutesToAdd)
  return dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function nowUTCStamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeICSText(str) {
  return String(str).replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n')
}

export function buildCalendarEvent(booking) {
  const { serviceName, barberName, date, time, duration } = booking
  const start = toICSDateTime(date, time)
  const end = addMinutes(start, duration)

  const title = `${serviceName} at ${shopInfo.name}`
  const description = `Appointment with ${barberName} at ${shopInfo.name}.`
  const location = `${shopInfo.address.street}, ${shopInfo.address.city}, ${shopInfo.address.postalCode}`

  return { title, description, location, start, end }
}

export function downloadICS(booking) {
  const { title, description, location, start, end } = buildCalendarEvent(booking)

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Prime Cuts//Booking//EN',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@primecuts.example`,
    `DTSTAMP:${nowUTCStamp()}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICSText(title)}`,
    `DESCRIPTION:${escapeICSText(description)}`,
    `LOCATION:${escapeICSText(location)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'prime-cuts-appointment.ics'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function googleCalendarUrl(booking) {
  const { title, description, location, start, end } = buildCalendarEvent(booking)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    details: description,
    location,
  })
  return `https://www.google.com/calendar/render?${params.toString()}`
}