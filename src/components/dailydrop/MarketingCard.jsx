import { useApp } from '../../context/AppContext'

// ─── Shared theme (used by DailyDropModal's preview step too) ────────────────
export const DD_DARK = '#243928'
export const DD_DARK_SOFT = '#E6EFE3'
export const DD_TEXT = '#1a1a1a'
export const DD_MUTED = '#6B6B67'

// ─── Shared marketing card body ─────────────────────────────────────────────
// `items` are normalized today's-drop items (id, name, image, todayPrice,
// todayQty, adHoc). `onCtaClick` makes the green WhatsApp footer interactive.
export function MarketingCardBody({ items, profile, onCtaClick }) {
  const CtaTag = onCtaClick ? 'button' : 'div'
  return (
    <div style={{
      background: DD_DARK,
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      padding: 14,
    }}>
      {/* Header */}
      <div style={{ padding: '8px 6px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: DD_DARK_SOFT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 22,
          }}>
            <span>{profile.businessType?.icon}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: 16,
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: '-0.01em',
            }}>{profile.businessName}</p>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: 12,
              margin: '3px 0 0',
              fontWeight: 500,
            }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.18)', marginTop: 14 }} />
      </div>

      {/* Products */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#fff',
            borderRadius: 14,
            padding: 10,
            paddingRight: 14,
          }}>
            {item.image && !item.adHoc ? (
              <img
                src={item.image}
                alt={item.name}
                style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 10,
                background: DD_DARK_SOFT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 28,
              }}>
                <span>{profile.businessType?.icon}</span>
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                color: DD_TEXT,
                fontWeight: 700,
                fontSize: 15,
                margin: 0,
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{item.name}</p>
              <p style={{
                color: DD_DARK,
                fontSize: 12,
                margin: '4px 0 0',
                fontWeight: 600,
              }}>Available: {item.todayQty}</p>
            </div>
            <p style={{
              color: DD_DARK,
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
              margin: 0,
            }}>₹{item.todayPrice}</p>
          </div>
        ))}
      </div>

      {/* Order on WhatsApp CTA */}
      <CtaTag
        {...(onCtaClick ? { onClick: onCtaClick, type: 'button' } : {})}
        style={{
          width: '100%',
          marginTop: 12,
          background: '#25D366',
          border: 'none',
          borderRadius: 14,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          cursor: onCtaClick ? 'pointer' : 'default',
          fontFamily: 'inherit',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <WhatsAppGlyph size={22} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 16, margin: 0, letterSpacing: '-0.01em' }}>
            Order on WhatsApp
          </p>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '2px 0 0', fontWeight: 500 }}>
            Tap to order · Limited qty
          </p>
        </div>
        {onCtaClick && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        )}
      </CtaTag>
    </div>
  )
}

// ─── Shared WhatsApp glyph ──────────────────────────────────────────────────
export function WhatsAppGlyph({ size = 22, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 21.82c-1.86 0-3.68-.5-5.27-1.45l-.38-.22-3.67.96.98-3.58-.25-.37A9.82 9.82 0 0 1 2.18 12C2.18 6.58 6.58 2.18 12 2.18S21.82 6.58 21.82 12 17.42 21.82 12 21.82zm5.39-7.36c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37s-1.04 1.02-1.04 2.49 1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"/>
    </svg>
  )
}

export default function MarketingCard({ onClose }) {
  const { state } = useApp()
  const { todaysDrop, profile } = state

  const link = `https://${todaysDrop.smartLink}`

  function copyLink() {
    navigator.clipboard?.writeText(link)
  }

  function shareWhatsApp() {
    const text = `🛍️ *${profile.businessName}* — Today's Drop!\n\n${todaysDrop.items.map(i => `• ${i.name} — ₹${i.todayPrice}`).join('\n')}\n\n🔗 Order here: ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '60px 16px 24px',
        overflowY: 'auto',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width: '100%',
        maxWidth: 430,
        background: '#fff',
        borderRadius: 24,
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        overflow: 'hidden',
      }}>
        {/* Close */}
        <div style={{ position: 'relative', padding: '20px 18px 0' }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#F0F0EB',
              color: DD_TEXT,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Celebration header */}
        <div style={{ padding: '8px 20px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{
            width: 78,
            height: 78,
            borderRadius: '50%',
            background: DD_DARK_SOFT,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 38,
            position: 'relative',
          }}>
            <span role="img" aria-label="party">🎉</span>
            {/* Confetti dots */}
            <ConfettiDots />
          </div>
          <h2 style={{
            color: DD_DARK,
            fontWeight: 800,
            fontSize: 26,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '20px 0 8px',
          }}>
            Published &amp; Live!
          </h2>
          <p style={{
            color: DD_MUTED,
            fontSize: 14,
            margin: 0,
            fontWeight: 500,
          }}>
            Your drop is now live and visible to customers.
          </p>
        </div>

        {/* Marketing card */}
        <div style={{ padding: '0 16px' }}>
          <MarketingCardBody
            items={todaysDrop.items}
            profile={profile}
            onCtaClick={shareWhatsApp}
          />
        </div>

        {/* Action buttons */}
        <div style={{ padding: '18px 16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={shareWhatsApp}
            style={{
              width: '100%',
              background: '#fff',
              color: DD_DARK,
              border: `1.5px solid ${DD_DARK}`,
              borderRadius: 14,
              padding: '15px 18px',
              fontWeight: 700,
              fontSize: 15,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <WhatsAppGlyph size={18} color={DD_DARK} />
            Share on WhatsApp
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={copyLink}
              style={{
                flex: 1,
                background: '#F2F4F0',
                color: DD_DARK,
                border: 'none',
                borderRadius: 14,
                padding: '14px 16px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DD_DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Copy link
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                background: '#F2F4F0',
                color: DD_DARK,
                border: 'none',
                borderRadius: 14,
                padding: '14px 16px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={DD_DARK} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConfettiDots() {
  const dots = [
    { top: -2, left: -10, size: 4, color: DD_DARK },
    { top: 4, left: -18, size: 3, color: '#9DC07B' },
    { top: 18, left: -14, size: 5, color: DD_DARK },
    { top: -8, left: 32, size: 3, color: DD_DARK },
    { top: 2, left: 78, size: 4, color: '#9DC07B' },
    { top: 22, left: 84, size: 3, color: DD_DARK },
    { top: -4, left: 60, size: 5, color: '#9DC07B' },
  ]
  return (
    <>
      {dots.map((d, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            borderRadius: '50%',
            background: d.color,
            opacity: 0.6,
          }}
        />
      ))}
    </>
  )
}
