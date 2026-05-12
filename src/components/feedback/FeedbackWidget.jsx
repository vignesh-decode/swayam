import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxsd8p9DdC4E7jF9kIFlNQiZrY-ntIgAOI7Inbz7QlhTR_ii5CFOEx6_3TpODf8V9rlCQ/exec'

const INITIAL_DELAY = 7 * 60 * 1000
const SNOOZE_DELAY = 2 * 60 * 1000

// ─── Star rating ─────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className="star-btn"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            type="button"
          >
            {star <= (hover || value) ? '★' : '☆'}
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <p style={{ textAlign: 'center', fontSize: 13, color: '#6B7A38', fontWeight: 600 }}>
          {labels[hover || value]}
        </p>
      )}
    </div>
  )
}

// ─── Field pill ──────────────────────────────────────────────────────────────
function FieldPill({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F5F5F3', borderRadius: 10, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: '#6B6B67', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#243928' }}>{value || '—'}</span>
    </div>
  )
}

// ─── Success screen ──────────────────────────────────────────────────────────
function SuccessScreen({ onClose }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#F0F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="17" stroke="#3D5E30" strokeWidth="1.5"/>
          <polyline points="10 18 16 24 26 12" stroke="#3D5E30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="tick-path"/>
        </svg>
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1A', marginBottom: 8 }}>Thank you!</h3>
      <p style={{ fontSize: 14, color: '#6B6B67', lineHeight: 1.6, marginBottom: 28 }}>
        Your feedback helps us build a better SWAYAM. We read every response.
      </p>
      <button
        onClick={onClose}
        style={{ background: '#243928', color: '#fff', border: 'none', borderRadius: 14, padding: '14px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Plus Jakarta Sans' }}
      >
        Done
      </button>
    </div>
  )
}

// ─── Feedback prompt popup ───────────────────────────────────────────────────
function FeedbackPrompt({ onGiveFeedback, onSnooze, onDismiss }) {
  return (
    <div className="modal-overlay" style={{ alignItems: 'center', padding: 24 }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 370,
        overflow: 'hidden',
        animation: 'bounceIn 0.4s cubic-bezier(0.68,-0.55,0.265,1.55)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        {/* Top accent bar */}
        <div style={{
          background: 'linear-gradient(135deg, #243928 0%, #3D5E30 50%, #6B7A38 100%)',
          padding: '28px 24px 24px',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* Icon */}
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 6, lineHeight: 1.3 }}>
            We'd love your feedback!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.5 }}>
            Help us make SWAYAM better for you
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 28px' }}>
          <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, textAlign: 'center', marginBottom: 24 }}>
            Your thoughts matter to us. Take a quick<br />
            <strong style={{ color: '#243928', fontWeight: 700 }}>30-second survey</strong> and help shape the future of SWAYAM.
          </p>

          {/* Quick info chips */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
            {[
              { icon: '⏱', text: '30 seconds' },
              { icon: '✨', text: '5 questions' },
            ].map(chip => (
              <div key={chip.text} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: '#F5F5F3', borderRadius: 50, padding: '6px 12px',
                fontSize: 11, fontWeight: 600, color: '#6B6B67',
              }}>
                <span>{chip.icon}</span> {chip.text}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onGiveFeedback}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #243928 0%, #6B7A38 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              padding: '16px',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            Share Feedback
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>

          {/* Snooze */}
          <button
            onClick={onSnooze}
            style={{
              width: '100%',
              background: 'none',
              border: '1.5px solid #E5E7EB',
              borderRadius: 14,
              padding: '14px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'Plus Jakarta Sans',
              color: '#6B6B67',
            }}
          >
            Maybe in a couple of minutes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Feedback form modal ─────────────────────────────────────────────────────
function FeedbackModal({ onClose, profile, onboardingComplete }) {
  const [rating, setRating] = useState(0)
  const [liked, setLiked] = useState('')
  const [improve, setImprove] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (rating === 0) { setError('Please give a rating before submitting'); return }
    setError('')
    setSubmitting(true)

    const payload = {
      timestamp:          new Date().toISOString(),
      userName:           profile.name || 'Not set',
      businessName:       profile.businessName || 'Not set',
      businessType:       profile.businessType?.name || 'Not set',
      businessTypeId:     profile.businessType?.id   || 'Not set',
      isPerishable:       profile.isPerishable === true ? 'Fresh daily' : profile.isPerishable === false ? 'Inventory/Stock' : 'Not set',
      deliveryType:       profile.deliveryType === 'self' ? 'Self / Pickup' : profile.deliveryType === 'partner' ? 'Delivery partner' : 'Not set',
      deliveryPartner:    profile.deliveryPartner?.name || 'None',
      payLaterEnabled:    profile.payLaterEnabled ? 'Yes' : 'No',
      onboardingComplete: onboardingComplete ? 'Yes' : 'No',
      rating,
      liked:             liked.trim(),
      improve:           improve.trim(),
      respondentName:    name.trim(),
      respondentContact: contact.trim(),
    }

    try {
      const formData = new URLSearchParams()
      formData.append('data', JSON.stringify(payload))
      await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: formData })
      setSubmitted(true)
    } catch (err) {
      console.warn('Feedback submit note:', err.message)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="feedback-modal">
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, marginBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E7EB' }} />
        </div>

        {submitted ? (
          <SuccessScreen onClose={onClose} />
        ) : (
          <div style={{ padding: '16px 20px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1C1C1A', marginBottom: 4 }}>Share your feedback</h2>
                <p style={{ fontSize: 13, color: '#6B6B67' }}>Help us make SWAYAM better for you</p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9CA3AF' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ background: '#F9F8F5', borderRadius: 14, padding: 14, marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10 }}>
                Your setup (auto-captured)
              </p>
              <FieldPill label="Business type"     value={profile.businessType?.name} />
              <FieldPill label="Production mode"   value={profile.isPerishable === true ? 'Fresh daily' : profile.isPerishable === false ? 'Inventory' : null} />
              <FieldPill label="Delivery"          value={profile.deliveryType === 'self' ? 'Self/Pickup' : profile.deliveryPartner?.name || null} />
              <FieldPill label="Pay later enabled" value={profile.payLaterEnabled ? 'Yes' : 'No'} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A', marginBottom: 12, textAlign: 'center' }}>
                How would you rate this app?
              </p>
              <StarRating value={rating} onChange={setRating} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                What do you like most? <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea className="input-field" rows={2} placeholder="e.g. The daily drop flow is super easy…" style={{ resize: 'none', fontSize: 14 }} value={liked} onChange={e => setLiked(e.target.value)} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                What can be improved? <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea className="input-field" rows={2} placeholder="e.g. I'd love to see…" style={{ resize: 'none', fontSize: 14 }} value={improve} onChange={e => setImprove(e.target.value)} />
            </div>

            <div style={{ background: '#F9F8F5', borderRadius: 14, padding: 14, marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 10 }}>
                Want us to follow up? (optional)
              </p>
              <input className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={{ marginBottom: 10, fontSize: 14 }} />
              <input className="input-field" placeholder="WhatsApp number or email" value={contact} onChange={e => setContact(e.target.value)} style={{ fontSize: 14 }} />
            </div>

            {error && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 10, textAlign: 'center' }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ width: '100%', background: submitting ? '#9CA3AF' : 'linear-gradient(135deg, #243928 0%, #6B7A38 100%)', color: '#fff', border: 'none', borderRadius: 14, padding: '15px', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Plus Jakarta Sans', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {submitting ? 'Submitting…' : 'Submit feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main widget ─────────────────────────────────────────────────────────────
export default function FeedbackWidget() {
  const { state } = useApp()
  const { profile, onboardingComplete } = state

  const [phase, setPhase] = useState('waiting')
  const timerRef = useRef(null)

  function schedulePrompt(delay) {
    clearTimeout(timerRef.current)
    setPhase('waiting')
    timerRef.current = setTimeout(() => setPhase('prompt'), delay)
  }

  useEffect(() => {
    schedulePrompt(INITIAL_DELAY)
    return () => clearTimeout(timerRef.current)
  }, [])

  if (phase === 'waiting') return null
  if (phase === 'dismissed') return null

  if (phase === 'prompt') {
    return (
      <FeedbackPrompt
        onGiveFeedback={() => setPhase('form')}
        onSnooze={() => schedulePrompt(SNOOZE_DELAY)}
        onDismiss={() => setPhase('dismissed')}
      />
    )
  }

  if (phase === 'form') {
    return (
      <FeedbackModal
        onClose={() => setPhase('dismissed')}
        profile={profile}
        onboardingComplete={onboardingComplete}
      />
    )
  }

  return null
}
