import { useEffect, useRef } from 'react'

export default function BookingSuccessModal({ customerFirstName, onClose }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
          ref={closeButtonRef}
        >
          &times;
        </button>
        <h2 id="success-modal-title">Thanks, {customerFirstName}!</h2>
        <p>Your appointment is booked. We'll see you soon.</p>
        <button type="button" className="btn" onClick={onClose}>
          View my booking details
        </button>
      </div>
    </div>
  )
}