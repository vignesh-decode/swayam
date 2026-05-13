import { useState, useEffect, useRef } from 'react'

const STEPS = [
  {
    target: '[data-ftu="fab"]',
    title: 'What are you selling today?',
    desc: 'Tap here every morning to set up your daily menu or product list. This is how your customers see what’s available.',
    position: 'top',
  },
  {
    target: '[data-ftu="header-stats"]',
    title: 'Today’s Summary',
    desc: 'A quick glance at your day — total orders received, cash already collected, and payments still pending.',
    position: 'bottom',
  },
  {
    target: '[data-ftu="today-card"]',
    title: 'Order Buckets',
    desc: 'See the big picture — total items and orders at a glance. Tap to drill into individual orders.',
    position: 'bottom',
  },
  {
    target: '[data-ftu="pending-payments"]',
    title: 'Pending Payments',
    desc: 'Track every “pay later” customer here. Follow up easily so nothing slips through.',
    position: 'top',
  },
]

export default function DashboardFTU({ onDone }) {
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState(null)
  const [shell, setShell] = useState(null)
  const [visible, setVisible] = useState(false)
  const overlayRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready) return
    const shellEl = document.querySelector('.app-shell')
    const el = document.querySelector(STEPS[step].target)
    if (!shellEl || !el) return

    const measure = () => {
      setRect(el.getBoundingClientRect())
      setShell(shellEl.getBoundingClientRect())
    }

    const isFixed = window.getComputedStyle(el).position === 'fixed'
    const r = el.getBoundingClientRect()
    const inView = r.top >= 0 && r.bottom <= window.innerHeight

    let timerId
    if (!isFixed && !inView) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      timerId = setTimeout(() => {
        measure()
        requestAnimationFrame(() => setVisible(true))
      }, 420)
    } else {
      measure()
      requestAnimationFrame(() => setVisible(true))
    }

    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      if (timerId) clearTimeout(timerId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [step, ready])

  if (!ready || !shell || !rect) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const next = () => {
    if (isLast) {
      onDone()
    } else {
      setStep(s => s + 1)
    }
  }

  const pad = 8

  const spotStyle = rect ? {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
    borderRadius: 16,
  } : null

  const tooltipAbove = current.position === 'top'
  const tooltipStyle = {
    position: 'fixed',
    left: shell.left + 16,
    right: window.innerWidth - shell.right + 16,
    zIndex: 10002,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(6px)',
    transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), top 0.4s cubic-bezier(0.4, 0, 0.2, 1), bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(tooltipAbove
      ? { bottom: window.innerHeight - rect.top + pad + 12 }
      : { top: rect.bottom + pad + 12 }
    ),
  }

  return (
    <div ref={overlayRef}>
      {/* Dark overlay scoped to app shell */}
      <div style={{
        position: 'fixed',
        top: shell.top,
        left: shell.left,
        width: shell.width,
        height: shell.height,
        zIndex: 10000,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.35s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
        <svg style={{ width: '100%', height: '100%', display: 'block' }}>
          <defs>
            <mask id="ftu-mask">
              <rect width="100%" height="100%" fill="white" />
              {spotStyle && (
                <rect
                  x={spotStyle.left - shell.left}
                  y={spotStyle.top - shell.top}
                  width={spotStyle.width}
                  height={spotStyle.height}
                  rx={spotStyle.borderRadius}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#ftu-mask)" />
        </svg>
      </div>

      {/* Spotlight border ring */}
      {spotStyle && (
        <div style={{
          position: 'fixed',
          ...spotStyle,
          zIndex: 10001,
          border: '2px solid rgba(255,255,255,0.5)',
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.35s ease, top 0.4s cubic-bezier(0.4, 0, 0.2, 1), left 0.4s cubic-bezier(0.4, 0, 0.2, 1), width 0.4s cubic-bezier(0.4, 0, 0.2, 1), height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      )}

      {/* Tooltip card */}
      <div style={tooltipStyle}>
        <div style={{
          background: '#fff',
          borderRadius: 18,
          padding: '20px 20px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#243928', marginBottom: 6 }}>{current.title}</p>
          <p style={{ fontSize: 13, color: '#6B6B67', lineHeight: 1.5, marginBottom: 16 }}>{current.desc}</p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Step dots */}
            <div style={{ display: 'flex', gap: 6 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 20 : 7,
                  height: 7,
                  borderRadius: 50,
                  background: i === step ? '#243928' : '#D1D5DB',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {!isLast && (
                <button
                  onClick={onDone}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                >
                  Skip
                </button>
              )}
              <button
                onClick={next}
                style={{
                  background: '#243928',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 18px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isLast ? 'Got it!' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
