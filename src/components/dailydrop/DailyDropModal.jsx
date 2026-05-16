import { useState } from 'react'
import { useApp, A } from '../../context/AppContext'
import MarketingCard, {
  MarketingCardBody,
  WhatsAppGlyph,
  DD_DARK,
  DD_DARK_SOFT,
  DD_TEXT,
  DD_MUTED,
} from './MarketingCard'

// ─── Local theme additions (only used by the select step) ────────────────────
const DD_BORDER = '#E5E5E0'
const DD_SUBPANEL = '#F4F4F0'

const ddInput = {
  width: '100%',
  background: '#fff',
  border: `1px solid ${DD_BORDER}`,
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 14,
  fontWeight: 600,
  color: DD_TEXT,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
}

function SectionHeader({ icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <div style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: DD_DARK_SOFT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <p style={{
        fontSize: 11,
        fontWeight: 700,
        color: DD_DARK,
        textTransform: 'uppercase',
        letterSpacing: '0.09em',
        margin: 0,
      }}>
        {label}
      </p>
    </div>
  )
}

// ─── Product selector row ─────────────────────────────────────────────────────
function ProductRow({ product, selected, overrides, onChange, onToggle }) {
  const isSelected = selected.includes(product.id)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      marginBottom: 10,
      overflow: 'hidden',
      boxShadow: isSelected
        ? '0 2px 10px rgba(36,57,40,0.08)'
        : '0 1px 3px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s ease',
    }}>
      <div
        onClick={() => onToggle(product.id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 14px',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          border: `2px solid ${isSelected ? DD_DARK : '#D1D5DB'}`,
          background: isSelected ? DD_DARK : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s',
        }}>
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <polyline points="2.5 6 5 8.5 9.5 3.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            objectFit: 'cover',
            background: '#f3f4f6',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 15,
            fontWeight: 700,
            color: DD_TEXT,
            margin: 0,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{product.name}</p>
          <p style={{
            fontSize: 12,
            color: DD_MUTED,
            margin: '2px 0 0',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{product.description}</p>
        </div>
        <p style={{
          fontSize: 15,
          fontWeight: 700,
          color: DD_DARK,
          flexShrink: 0,
          margin: 0,
        }}>₹{product.price}</p>
      </div>

      {isSelected && (
        <div className="animate-fade-in" style={{
          background: DD_SUBPANEL,
          padding: '14px 14px 16px',
          display: 'flex',
          gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <label style={{
              fontSize: 11,
              color: DD_MUTED,
              fontWeight: 500,
              display: 'block',
              marginBottom: 6,
            }}>Today's price (₹)</label>
            <input
              type="number"
              style={ddInput}
              value={overrides[product.id]?.price ?? product.price}
              onChange={e => onChange(product.id, 'price', +e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{
              fontSize: 11,
              color: DD_MUTED,
              fontWeight: 500,
              display: 'block',
              marginBottom: 6,
            }}>Quantity available</label>
            <input
              type="number"
              style={ddInput}
              value={overrides[product.id]?.qty ?? product.inStock}
              onChange={e => onChange(product.id, 'qty', +e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Ad-hoc product form ──────────────────────────────────────────────────────
function AdHocSection({ items, onAdd, onRemove }) {
  const [form, setForm] = useState({ name: '', price: '', qty: '' })
  const [error, setError] = useState('')

  function addItem() {
    if (!form.name || !form.price || !form.qty) { setError('Fill all fields'); return }
    onAdd({ id: `adhoc-${Date.now()}`, name: form.name, price: +form.price, qty: +form.qty, adHoc: true })
    setForm({ name: '', price: '', qty: '' })
    setError('')
  }

  const adHocInput = {
    ...ddInput,
    background: '#fff',
    fontWeight: 500,
    padding: '13px 14px',
    fontSize: 14,
  }

  return (
    <div style={{ marginTop: 22 }}>
      <SectionHeader
        label="Add item not in your catalog"
        icon={
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DD_DARK} strokeWidth="2.8" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          style={adHocInput}
          placeholder="Product name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="number"
            style={{ ...adHocInput, flex: 1 }}
            placeholder="Price (₹)"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          />
          <input
            type="number"
            style={{ ...adHocInput, flex: 1 }}
            placeholder="Qty"
            value={form.qty}
            onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
          />
        </div>
        {error && <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>}
        <button
          onClick={addItem}
          style={{
            width: '100%',
            background: 'transparent',
            border: `1.5px dashed ${DD_DARK}`,
            borderRadius: 14,
            padding: '14px',
            color: DD_DARK,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'background 0.15s',
          }}
          onMouseDown={e => e.currentTarget.style.background = 'rgba(36,57,40,0.04)'}
          onMouseUp={e => e.currentTarget.style.background = 'transparent'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add to today's drop
        </button>
      </div>

      {items.length > 0 && (
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              background: '#fff',
              borderRadius: 14,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: DD_TEXT, margin: 0 }}>{item.name}</p>
                <p style={{ fontSize: 12, color: DD_MUTED, margin: '2px 0 0' }}>₹{item.price} · Qty: {item.qty}</p>
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#92400E',
                background: '#FEF3C7',
                padding: '3px 10px',
                borderRadius: 999,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>Ad-hoc</span>
              <button
                onClick={() => onRemove(item.id)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', padding: 4, cursor: 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Daily Drop Modal ────────────────────────────────────────────────────
export default function DailyDropModal() {
  const { state, dispatch } = useApp()
  const { catalog, showDailyDropModal, profile, todaysDrop, showMarketingCard } = state

  const [step, setStep] = useState('select') // 'select' | 'preview'
  const [selected, setSelected] = useState(() =>
    todaysDrop.isActive ? todaysDrop.items.map(i => i.id) : []
  )
  const [overrides, setOverrides] = useState(() => {
    if (!todaysDrop.isActive) return {}
    return Object.fromEntries(todaysDrop.items.map(i => [i.id, { price: i.todayPrice, qty: i.todayQty }]))
  })
  const [adHocItems, setAdHocItems] = useState(() =>
    todaysDrop.isActive ? todaysDrop.items.filter(i => i.adHoc) : []
  )

  function toggleProduct(id) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  function updateOverride(id, field, value) {
    setOverrides(o => ({ ...o, [id]: { ...o[id], [field]: value } }))
  }

  function buildItems() {
    const catalogItems = catalog
      .filter(p => selected.includes(p.id))
      .map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        description: p.description,
        todayPrice: overrides[p.id]?.price ?? p.price,
        todayQty: overrides[p.id]?.qty ?? p.inStock,
        remaining: overrides[p.id]?.qty ?? p.inStock,
        adHoc: false,
      }))
    const adhoc = adHocItems.map(i => ({
      id: i.id,
      name: i.name,
      image: null,
      description: '',
      todayPrice: i.price,
      todayQty: i.qty,
      remaining: i.qty,
      adHoc: true,
    }))
    return [...catalogItems, ...adhoc]
  }

  function handlePreview() {
    if (selected.length === 0 && adHocItems.length === 0) return
    setStep('preview')
  }

  function handlePublish() {
    dispatch({ type: A.PUBLISH_DAILY_DROP, payload: buildItems() })
    setStep('select')
  }

  function close() {
    dispatch({ type: A.CLOSE_DAILY_DROP })
    if (step === 'preview') setStep('select')
  }

  const totalSelected = selected.length + adHocItems.length

  // Marketing card preview overlay
  if (showMarketingCard) {
    return <MarketingCard onClose={() => dispatch({ type: A.CLOSE_MARKETING_CARD })} />
  }

  if (!showDailyDropModal) return null

  const isSelectStep = step === 'select'

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal-sheet">
        {/* Header */}
        {isSelectStep ? (
          <div
            className="sticky top-0"
            style={{
              background: DD_DARK,
              padding: '22px 20px 20px',
              borderRadius: '20px 20px 0 0',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: 22,
                  lineHeight: 1.15,
                  letterSpacing: '-0.01em',
                  margin: 0,
                }}>
                  Today's Drop
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: 12,
                  margin: '6px 0 0',
                  fontWeight: 500,
                }}>
                  {totalSelected} selected · Set prices & qty for today
                </p>
              </div>
              <button
                onClick={close}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.9)',
                  padding: 4,
                  cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div
            className="sticky top-0"
            style={{
              background: '#fff',
              padding: '18px 18px 16px',
              borderRadius: '20px 20px 0 0',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: DD_DARK_SOFT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={DD_DARK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{
                color: DD_TEXT,
                fontWeight: 800,
                fontSize: 19,
                lineHeight: 1.15,
                letterSpacing: '-0.01em',
                margin: 0,
              }}>
                Preview Card
              </h2>
              <p style={{
                color: DD_MUTED,
                fontSize: 12,
                margin: '3px 0 0',
                fontWeight: 500,
              }}>
                This is what your customers will see
              </p>
            </div>
            <button
              onClick={close}
              style={{
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
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {step === 'select' && (
          <div style={{ padding: '18px 16px 20px' }}>
            {/* Catalog products */}
            <SectionHeader
              label="From your WhatsApp catalog"
              icon={<WhatsAppGlyph size={13} color={DD_DARK} />}
            />
            {catalog.map(product => (
              <ProductRow
                key={product.id}
                product={product}
                selected={selected}
                overrides={overrides}
                onChange={updateOverride}
                onToggle={toggleProduct}
              />
            ))}

            {/* Ad-hoc */}
            <AdHocSection
              items={adHocItems}
              onAdd={item => setAdHocItems(a => [...a, item])}
              onRemove={id => setAdHocItems(a => a.filter(i => i.id !== id))}
            />

            {/* CTA */}
            <div style={{ marginTop: 22, paddingBottom: 8 }}>
              <button
                onClick={handlePreview}
                disabled={totalSelected === 0}
                style={{
                  width: '100%',
                  background: totalSelected === 0 ? '#9CA3AF' : DD_DARK,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 15,
                  borderRadius: 14,
                  padding: '16px 24px',
                  border: 'none',
                  cursor: totalSelected === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  letterSpacing: '0.01em',
                  transition: 'transform 0.1s, background 0.15s',
                }}
                onMouseDown={e => totalSelected > 0 && (e.currentTarget.style.transform = 'scale(0.99)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                Preview marketing card →
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div style={{ padding: '18px 16px 16px' }}>
            {/* Card preview (shared with post-publish overlay) */}
            <MarketingCardBody items={buildItems()} profile={profile} />

            <div style={{ display: 'flex', gap: 12, marginTop: 18, paddingBottom: 4 }}>
              <button
                onClick={() => setStep('select')}
                style={{
                  flex: 1,
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
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
                Edit
              </button>
              <button
                onClick={handlePublish}
                style={{
                  flex: 1,
                  background: DD_DARK,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 14,
                  padding: '15px 18px',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
                Publish &amp; Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
