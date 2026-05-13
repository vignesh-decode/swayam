import { useState, useMemo } from 'react'
import { useApp, A } from '../../context/AppContext'
import { calcDeliveryFee, mockDistanceFromAddress } from '../../data/deliveryPartners'

const CATEGORY_COLORS = {
  Cakes:    '#2F7A4B',
  Cupcakes: '#8A4FCB',
  Cookies:  '#D8861C',
  Breads:   '#9A6A2F',
  Pastries: '#C2548A',
  Snacks:   '#3B6FB5',
  Combos:   '#2F7A4B',
  Special:  '#8A4FCB',
  Healthy:  '#2A8C7A',
}
const categoryColor = c => CATEGORY_COLORS[c] || '#3D5E30'

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconCart = ({ size = 22, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M3 4h2.2l2.3 11.2a1.5 1.5 0 0 0 1.5 1.2h8.2a1.5 1.5 0 0 0 1.5-1.2L20.5 8H6.2" />
  </svg>
)
const IconStar = ({ size = 14, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2.5 14.9 8.6 21.5 9.5 16.7 14.1 17.9 20.7 12 17.6 6.1 20.7 7.3 14.1 2.5 9.5 9.1 8.6" />
  </svg>
)
const IconBike = ({ size = 14, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.2" />
    <circle cx="18.5" cy="17.5" r="3.2" />
    <path d="M5.5 17.5 9 9h5l3.5 8.5M14 9l-1.5-3h-3" />
  </svg>
)
const IconChevronRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
)
const IconRepeat = ({ size = 14, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 2 21 6 17 10" />
    <path d="M3 12V8a2 2 0 0 1 2-2h16" />
    <polyline points="7 22 3 18 7 14" />
    <path d="M21 12v4a2 2 0 0 1-2 2H3" />
  </svg>
)
const IconCalendar = ({ size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17" />
    <path d="M8 3v4M16 3v4" />
    <text x="12" y="17" fontSize="6.5" fontWeight="700" textAnchor="middle" fill={stroke} stroke="none">7</text>
  </svg>
)
const IconCheckSquare = ({ size = 18, stroke = '#fff' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const IconClose = ({ size = 16, stroke = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
)

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function formatFrequency(sub) {
  if (!sub) return ''
  if (sub.frequency === 'daily') return 'Every day'
  if (sub.frequency === 'every_n_days') {
    const n = sub.intervalDays || 1
    return `Every ${n} day${n > 1 ? 's' : ''}`
  }
  if (sub.frequency === 'specific_days') {
    const wd = sub.weekdays || []
    if (wd.length === 7) return 'Every day'
    if (wd.length === 0) return 'No days selected'
    return `On ${wd.map(d => WEEKDAYS[d]).join(', ')}`
  }
  return ''
}

function formatDeliveryLabel(date) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  const diff = Math.round((d - today) / (24 * 60 * 60 * 1000))
  const dm = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  if (diff === 0) return `Today, ${dm}`
  if (diff === 1) return `Tomorrow, ${dm}`
  return `${d.toLocaleDateString('en-IN', { weekday: 'short' })}, ${dm}`
}

// ─── Product card (horizontal list row) ──────────────────────────────────────
function ProductCard({ item, qty, onAdd, onRemove, onSubscribe, onEditSubscription, isBestseller, subscription }) {
  const remaining = item.remaining ?? item.todayQty
  const soldOut = remaining === 0
  const catColor = categoryColor(item.category)

  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] ${soldOut ? 'opacity-60' : ''}`}>
      <div className="flex">
        {/* Image */}
        <div className="relative w-[132px] h-[156px] flex-shrink-0 p-2">
          {item.image && !item.adHoc ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl bg-gray-100" />
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
              <span className="text-4xl">🛍️</span>
            </div>
          )}
          {isBestseller && !soldOut && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 shadow-sm">
              <span style={{ color: '#2F7A4B' }}><IconStar size={11} /></span>
              <span className="text-[10px] font-800" style={{ color: '#1F4D33' }}>Best seller</span>
            </div>
          )}
        </div>

        {/* Right content */}
        <div className="flex-1 py-3 pr-3 pl-1 flex flex-col">
          {item.category && (
            <p
              className="text-[10px] font-800 tracking-[0.12em] uppercase"
              style={{ color: catColor }}
            >
              {item.category}
            </p>
          )}
          <p className="font-800 text-gray-900 text-[15px] leading-tight mt-1">{item.name}</p>
          {item.description && (
            <p className="text-[12px] font-600 text-gray-500 mt-1 leading-snug line-clamp-2">{item.description}</p>
          )}
          <p className="font-800 text-[15px] mt-2" style={{ color: '#1F4D33' }}>₹{item.todayPrice}</p>

          <div className="mt-auto pt-2">
            {soldOut ? (
              <span className="inline-block text-[11px] font-700 px-3 py-1 rounded-full bg-red-50 text-red-600">Sold out</span>
            ) : subscription ? (
              <button
                onClick={() => onEditSubscription(item, subscription)}
                className="w-full rounded-xl border-[1.5px] p-2.5 text-left flex items-center gap-2.5 active:scale-[0.99] transition-transform"
                style={{ borderColor: '#1F4D33', background: '#F1F8F2' }}
              >
                <span className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#1F4D33' }}>
                  <IconRepeat size={13} stroke="#fff" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-800 leading-tight truncate" style={{ color: '#1F4D33' }}>
                    {formatFrequency(subscription)} · {subscription.qty} qty
                  </p>
                  <p className="text-[10px] font-600 text-gray-500 truncate mt-0.5">
                    {subscription.nextDeliveryAt ? `Next: ${formatDeliveryLabel(subscription.nextDeliveryAt)}` : 'Tap to edit'}
                  </p>
                </div>
                <span className="text-[11px] font-700 flex items-center gap-0.5 flex-shrink-0" style={{ color: '#1F4D33' }}>
                  Edit <IconChevronRight size={10} />
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  aria-label="Decrease"
                  onClick={() => onRemove(item.id)}
                  disabled={qty === 0}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40"
                  style={{ background: '#E6F0E8' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F4D33" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14" /></svg>
                </button>
                <div className="min-w-[40px] h-9 px-2 rounded-xl border border-gray-200 flex items-center justify-center font-800 text-gray-900 text-[15px]">
                  {qty}
                </div>
                <button
                  aria-label="Increase"
                  onClick={() => onAdd(item.id)}
                  disabled={qty >= remaining}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-transform active:scale-90 disabled:opacity-40"
                  style={{ background: '#1F4D33' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                </button>
                <button
                  onClick={() => onSubscribe(item)}
                  className="h-9 px-3 rounded-xl border-[1.5px] flex items-center gap-1.5 font-700 text-[12px] transition-colors active:scale-95"
                  style={{ background: 'transparent', borderColor: '#1F4D33', color: '#1F4D33' }}
                >
                  <IconRepeat size={13} stroke="#1F4D33" />
                  Subscribe
                </button>
              </div>
            )}
            {remaining < 5 && remaining > 0 && (
              <p className="text-[11px] text-red-500 mt-1.5 font-600">Only {remaining} left</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Cart summary bar (sticky bottom) ────────────────────────────────────────
function CartBar({ cart, items, onCheckout }) {
  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0)
  if (totalItems === 0) return null

  const subtotal = Object.entries(cart).reduce((s, [id, qty]) => {
    const item = items.find(i => i.id === id)
    return s + (item ? item.todayPrice * qty : 0)
  }, 0)

  return (
    <div className="absolute bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-2 pointer-events-none">
      <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.10)] border border-gray-100 flex items-center gap-3 pl-3 pr-2 py-2 pointer-events-auto">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#E6F0E8', color: '#1F4D33' }}>
          <IconCart size={20} stroke="#1F4D33" />
        </div>
        <button onClick={onCheckout} className="flex flex-col items-start text-left bg-transparent border-0 p-0 cursor-pointer">
          <span className="text-[13px] font-800 text-gray-900 leading-none">{totalItems} items</span>
          <span className="text-[12px] font-600 text-gray-500 flex items-center gap-1 mt-0.5">View cart <IconChevronRight size={11} /></span>
        </button>
        <span className="ml-auto font-800 text-[15px] text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
        <button
          onClick={onCheckout}
          className="rounded-xl px-5 py-3 text-white font-800 text-[14px]"
          style={{ background: '#1F4D33' }}
        >
          Checkout
        </button>
      </div>
    </div>
  )
}

// ─── Subscribe modal ─────────────────────────────────────────────────────────
function SubscribeModal({ item, existing, onClose, onConfirm, onRemove }) {
  const isEdit = Boolean(existing)
  const [qty, setQty] = useState(existing?.qty ?? 1)
  const [tab, setTab] = useState(existing?.frequency ?? 'daily')
  const [intervalDays, setIntervalDays] = useState(existing?.intervalDays ?? 3)
  const [weekdays, setWeekdays] = useState(() => existing?.weekdays ?? [new Date().getDay()])
  const remaining = item.remaining ?? item.todayQty
  const maxQty = Math.max(1, remaining || 1)

  const nextDelivery = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0)
    if (tab === 'daily') {
      d.setDate(d.getDate() + 1)
      return d
    }
    if (tab === 'every_n_days') {
      d.setDate(d.getDate() + intervalDays)
      return d
    }
    if (tab === 'specific_days') {
      if (weekdays.length === 0) return null
      const today = new Date().getDay()
      for (let i = 1; i <= 7; i++) {
        const probe = (today + i) % 7
        if (weekdays.includes(probe)) {
          d.setDate(d.getDate() + i)
          return d
        }
      }
    }
    return null
  }, [tab, intervalDays, weekdays])

  const freqLabel = tab === 'daily'
    ? 'every day'
    : tab === 'every_n_days'
      ? `every ${intervalDays} day${intervalDays > 1 ? 's' : ''}`
      : weekdays.length === 7
        ? 'every day'
        : weekdays.length === 0
          ? 'on selected days'
          : `every ${weekdays.map(d => WEEKDAYS[d]).join(', ')}`

  const total = item.todayPrice * qty
  const canSubmit = tab !== 'specific_days' || weekdays.length > 0

  function toggleWeekday(d) {
    setWeekdays(w => w.includes(d) ? w.filter(x => x !== d) : [...w, d].sort())
  }

  function submit() {
    if (!canSubmit) return
    onConfirm({
      existingId: existing?.id ?? null,
      itemId: item.id,
      itemName: item.name,
      itemPrice: item.todayPrice,
      itemImage: item.image,
      itemUnit: item.unit,
      itemDescription: item.description,
      qty,
      frequency: tab,
      intervalDays: tab === 'every_n_days' ? intervalDays : null,
      weekdays: tab === 'specific_days' ? weekdays : null,
      nextDeliveryAt: nextDelivery ? nextDelivery.toISOString() : null,
    })
  }

  return (
    <div className="absolute inset-0 z-[80] flex items-end" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
      <div
        className="w-full bg-white rounded-t-[24px] max-h-[88%] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
      >
        {/* Drag handle */}
        <div className="pt-2 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 flex items-start justify-between">
          <div>
            <h2 className="font-800 text-[22px] text-gray-900 leading-tight">{isEdit ? 'Edit subscription' : 'Subscribe'}</h2>
            <p className="text-[13px] font-600 text-gray-500 mt-0.5">
              {isEdit ? 'Change frequency, quantity, or remove' : 'Set up a repeat order and save time'}
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#F1F2EE', color: '#4B5563' }}
          >
            <IconClose size={14} stroke="#4B5563" />
          </button>
        </div>

        <div className="h-px bg-gray-100 mx-5" />

        {/* Item summary row */}
        <div className="px-5 py-4 flex items-center gap-3">
          {item.image && !item.adHoc ? (
            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-gray-100" />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-brand-100 flex items-center justify-center text-2xl">🛍️</div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-800 text-[15px] text-gray-900 truncate">{item.name}</p>
            <p className="text-[12px] font-600 text-gray-500 truncate mt-0.5">
              ₹{item.todayPrice}{item.description ? ` • ${item.description.replace(/\.$/, '')}` : item.unit ? ` • ${item.unit}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              aria-label="Decrease"
              onClick={() => setQty(q => Math.max(1, q - 1))}
              disabled={qty <= 1}
              className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ background: '#E6F0E8' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F4D33" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14" /></svg>
            </button>
            <div className="min-w-[40px] h-9 px-2 rounded-xl border border-gray-200 flex items-center justify-center font-800 text-gray-900 text-[15px]">
              {qty}
            </div>
            <button
              aria-label="Increase"
              onClick={() => setQty(q => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty}
              className="w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-40"
              style={{ background: '#1F4D33' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-5" />

        {/* Frequency selector */}
        <div className="px-5 pt-4">
          <p className="font-800 text-[15px] text-gray-900">Choose how often you want this</p>

          <div className="mt-3 grid grid-cols-3 rounded-2xl border border-gray-200 overflow-hidden p-1 bg-white">
            {[
              { id: 'daily',          label: 'Daily' },
              { id: 'every_n_days',   label: 'Every few days' },
              { id: 'specific_days',  label: 'Specific days' },
            ].map((t, i) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[12px] font-700 transition-colors"
                  style={
                    active
                      ? { background: '#E6F0E8', color: '#1F4D33' }
                      : { background: 'transparent', color: '#6B7280', borderLeft: i > 0 ? '1px solid #F1F2EE' : 'none' }
                  }
                >
                  {active
                    ? <span className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#1F4D33' }}><IconCheckSquare size={12} /></span>
                    : <IconCalendar size={14} stroke="#6B7280" />}
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-5 pt-4">
          {tab === 'daily' && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-800 text-[15px] text-gray-900">Every day</p>
                <span className="text-[10px] font-800 px-2.5 py-1 rounded-full" style={{ background: '#E6F0E8', color: '#1F4D33' }}>Recommended</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="px-4 py-3 flex items-center gap-2.5">
                <IconCalendar size={16} stroke="#6B7280" />
                <span className="text-[13px] font-600 text-gray-500">Next delivery:</span>
                <span className="text-[13px] font-800" style={{ color: '#1F4D33' }}>{nextDelivery && formatDeliveryLabel(nextDelivery)}</span>
              </div>
            </div>
          )}

          {tab === 'every_n_days' && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <p className="font-800 text-[15px] text-gray-900">Every {intervalDays} day{intervalDays > 1 ? 's' : ''}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIntervalDays(n => Math.max(2, n - 1))}
                    disabled={intervalDays <= 2}
                    className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
                    style={{ background: '#E6F0E8' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1F4D33" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14" /></svg>
                  </button>
                  <span className="min-w-[28px] text-center font-800 text-gray-900 text-[14px]">{intervalDays}</span>
                  <button
                    onClick={() => setIntervalDays(n => Math.min(30, n + 1))}
                    disabled={intervalDays >= 30}
                    className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
                    style={{ background: '#1F4D33' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                  </button>
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="px-4 py-3 flex items-center gap-2.5">
                <IconCalendar size={16} stroke="#6B7280" />
                <span className="text-[13px] font-600 text-gray-500">Next delivery:</span>
                <span className="text-[13px] font-800" style={{ color: '#1F4D33' }}>{nextDelivery && formatDeliveryLabel(nextDelivery)}</span>
              </div>
            </div>
          )}

          {tab === 'specific_days' && (
            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3">
                <p className="font-800 text-[15px] text-gray-900 mb-3">Pick the days</p>
                <div className="flex gap-1.5 justify-between">
                  {WEEKDAYS.map((d, i) => {
                    const on = weekdays.includes(i)
                    return (
                      <button
                        key={d}
                        onClick={() => toggleWeekday(i)}
                        className="w-9 h-9 rounded-full text-[12px] font-800 transition-colors"
                        style={on
                          ? { background: '#1F4D33', color: '#fff' }
                          : { background: '#F1F2EE', color: '#4B5563' }}
                      >
                        {d[0]}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="px-4 py-3 flex items-center gap-2.5">
                <IconCalendar size={16} stroke="#6B7280" />
                <span className="text-[13px] font-600 text-gray-500">Next delivery:</span>
                <span className="text-[13px] font-800" style={{ color: '#1F4D33' }}>
                  {nextDelivery ? formatDeliveryLabel(nextDelivery) : 'Select at least one day'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-5 pt-5 pb-4 space-y-2">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className="w-full rounded-2xl py-4 text-white font-800 text-[15px] flex flex-col items-center justify-center leading-tight disabled:opacity-50"
            style={{ background: '#1F4D33' }}
          >
            <span>{isEdit ? 'Update subscription' : 'Add subscription'}</span>
            <span className="text-[12px] font-600 opacity-80 mt-0.5">₹{total.toLocaleString('en-IN')} {freqLabel}</span>
          </button>
          {isEdit && (
            <button
              onClick={() => onRemove(existing.id)}
              className="w-full rounded-2xl py-3 font-700 text-[13px]"
              style={{ background: 'transparent', color: '#B91C1C' }}
            >
              Remove subscription
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Checkout screen ─────────────────────────────────────────────────────────
function CheckoutScreen({ cart, items, profile, onBack, onPlaceOrder }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [payMode, setPayMode] = useState('now')
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState({})

  const subtotal = Object.entries(cart).reduce((s, [id, qty]) => {
    const item = items.find(i => i.id === id)
    return s + (item ? item.todayPrice * qty : 0)
  }, 0)

  const distance = address.length > 5 ? mockDistanceFromAddress(address) : 0
  const partnerActive = profile.deliveryType === 'partner' || profile.deliveryType === 'both'
  const selfActive    = profile.deliveryType === 'self'    || profile.deliveryType === 'both'
  const deliveryFee = partnerActive && profile.deliveryPartner && distance > 0
    ? calcDeliveryFee(profile.deliveryPartner, distance)
    : 0
  const total = subtotal + deliveryFee

  const orderedItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = items.find(i => i.id === id)
      return { ...item, qty }
    })

  function validate() {
    const e = {}
    if (!name.trim())    e.name = 'Enter your name'
    if (!phone.trim() || !/^\d{10}$/.test(phone)) e.phone = 'Enter a valid 10-digit number'
    if (!address.trim()) e.address = 'Enter your delivery address'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handlePlace() {
    if (!validate()) return
    setPlacing(true)
    setTimeout(() => {
      onPlaceOrder({
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: orderedItems,
        subtotal,
        deliveryFee,
        total,
        paymentMode: payMode,
        status: 'new',
      })
      setPlacing(false)
    }, 800)
  }

  return (
    <div className="app-shell animate-fade-in">
      {/* Header */}
      <div className="sw-header" style={{ padding: '20px' }}>
        <div style={{ marginBottom: 14 }}>
          <img src="/logo.svg" alt="SWAYAM" style={{ height: 26, width: 'auto' }} />
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-white" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginLeft: -4, display: 'flex' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div>
            <h1 className="text-white font-800 text-base">Checkout</h1>
            <p className="text-white/60 text-xs">{orderedItems.length} item{orderedItems.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {/* Order summary */}
        <div className="card p-4 mb-4">
          <p className="font-700 text-gray-900 text-sm mb-3">Order summary</p>
          {orderedItems.map(item => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span className="text-gray-700">{item.name} × {item.qty}</span>
              <span className="font-600">₹{item.todayPrice * item.qty}</span>
            </div>
          ))}
          <div className="h-px bg-gray-100 my-3" />
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Delivery ({distance}km via {profile.deliveryPartner?.name})</span>
              <span>₹{deliveryFee}</span>
            </div>
          )}
          {selfActive && !deliveryFee && (
            <div className="flex justify-between text-sm mb-1 text-brand-700">
              <span>Delivery</span>
              <span className="font-600">Free / Pickup</span>
            </div>
          )}
          <div className="flex justify-between font-800 text-base mt-2">
            <span>Total</span>
            <span className="text-brand-700">₹{total}</span>
          </div>
        </div>

        {/* Contact */}
        <div className="card p-4 mb-4">
          <p className="font-700 text-gray-900 text-sm mb-3">Your details</p>
          <div className="flex flex-col gap-3">
            <div>
              <input className="input-field" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <input className="input-field" placeholder="Phone number (10 digits)" type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <textarea className="input-field resize-none" rows={3} placeholder="Delivery address" value={address} onChange={e => setAddress(e.target.value)} />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* Payment mode */}
        <div className="card p-4 mb-4">
          <p className="font-700 text-gray-900 text-sm mb-3">Payment</p>
          <div className="flex gap-3">
            <button
              onClick={() => setPayMode('now')}
              className={`flex-1 py-3 rounded-xl text-sm font-600 border-2 transition-all ${payMode === 'now' ? 'border-brand-700 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'}`}
            >
              💳 Pay now
            </button>
            {profile.payLaterEnabled && (
              <button
                onClick={() => setPayMode('later')}
                className={`flex-1 py-3 rounded-xl text-sm font-600 border-2 transition-all ${payMode === 'later' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500'}`}
              >
                ⏳ Pay later
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Place order */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 pb-6 bg-white border-t border-gray-100">
        <button
          className="btn-primary flex items-center justify-center gap-2"
          onClick={handlePlace}
          disabled={placing}
        >
          {placing ? (
            <><span className="animate-spin">⏳</span> Placing order…</>
          ) : (
            <>🎉 Place order · ₹{total}</>
          )}
        </button>
      </div>
    </div>
  )
}

// ─── Order confirmation ───────────────────────────────────────────────────────
function OrderConfirmation({ orderId, businessName, businessIcon, isPerishable, onDone }) {
  return (
    <div className="app-shell flex flex-col items-center justify-center p-8 text-center animate-bounce-in">
      <div className="w-20 h-20 rounded-full bg-[#25D366] flex items-center justify-center mb-5 animate-bounce-in">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h1 className="font-800 text-2xl text-gray-900 mb-2">Order placed! 🎉</h1>
      <p className="text-gray-500 mb-6">
        <span className="font-600 text-gray-700">{businessName}</span> has received your order.
      </p>

      <div className="card w-full p-5 mb-6 text-left">
        <p className="text-xs font-600 text-gray-400 uppercase tracking-wider mb-3">Status</p>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse flex-shrink-0" />
          <div>
            <p className="font-700 text-gray-900">Your order is confirmed</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {isPerishable ? 'Being prepared fresh for you' : 'Being packed & ready soon'}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Order ID: {orderId}</p>
      </div>

      <button className="btn-secondary" onClick={onDone}>
        ← Back to store
      </button>
    </div>
  )
}

// ─── Main Storefront ──────────────────────────────────────────────────────────
export default function Storefront() {
  const { state, dispatch } = useApp()
  const { todaysDrop, profile, storefrontOrderId, subscriptions } = state

  const [cart, setCart] = useState({})
  const [screen, setScreen] = useState('catalog') // 'catalog' | 'checkout' | 'confirmation'
  const [activeCategory, setActiveCategory] = useState('All')
  const [subscribeCtx, setSubscribeCtx] = useState(null) // { item, existing? }
  const [toast, setToast] = useState(null)

  const subscriptionByItemId = useMemo(() => {
    const m = {}
    for (const s of subscriptions || []) m[s.itemId] = s
    return m
  }, [subscriptions])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleConfirmSubscription({ existingId, ...payload }) {
    if (existingId) {
      dispatch({ type: A.UPDATE_SUBSCRIPTION, payload: { id: existingId, changes: payload } })
      showToast(`Updated subscription`)
    } else {
      dispatch({ type: A.ADD_SUBSCRIPTION, payload })
      showToast(`Subscribed to ${payload.itemName}`)
    }
    setSubscribeCtx(null)
  }

  function handleRemoveSubscription(id) {
    dispatch({ type: A.REMOVE_SUBSCRIPTION, payload: id })
    setSubscribeCtx(null)
    showToast('Subscription removed')
  }

  const items = todaysDrop.items
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))],
    [items]
  )
  const visibleItems = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory)
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0)

  function addToCart(id) {
    const item = items.find(i => i.id === id)
    const currentQty = cart[id] || 0
    const remaining = item?.remaining ?? item?.todayQty ?? 0
    if (currentQty >= remaining) return
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  }

  function removeFromCart(id) {
    setCart(c => {
      const n = { ...c }
      if (n[id] <= 1) delete n[id]
      else n[id]--
      return n
    })
  }

  function handlePlaceOrder(orderData) {
    dispatch({ type: A.PLACE_ORDER, payload: orderData })
    setCart({})
    setScreen('confirmation')
  }

  // No active drop
  if (!todaysDrop.isActive || items.length === 0) {
    return (
      <div className="app-shell">
        <div className="sw-header" style={{ padding: '20px' }}>
          <div style={{ marginBottom: 14 }}>
            <img src="/logo.svg" alt="SWAYAM" style={{ height: 26, width: 'auto' }} />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{profile.businessType?.icon}</span>
            <div>
              <h1 className="text-white font-800 text-lg">{profile.businessName}</h1>
              <p className="text-white/60 text-xs">No items available today</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <span className="text-5xl mb-4">🕐</span>
          <p className="font-700 text-gray-900 text-lg mb-2">Not open yet today</p>
          <p className="text-gray-500 text-sm">Check back later — the daily drop hasn't been published yet.</p>
        </div>
      </div>
    )
  }

  if (screen === 'confirmation') {
    return (
      <OrderConfirmation
        orderId={storefrontOrderId}
        businessName={profile.businessName}
        businessIcon={profile.businessType?.icon}
        isPerishable={profile.isPerishable}
        onDone={() => setScreen('catalog')}
      />
    )
  }

  if (screen === 'checkout') {
    return (
      <CheckoutScreen
        cart={cart}
        items={items}
        profile={profile}
        onBack={() => setScreen('catalog')}
        onPlaceOrder={handlePlaceOrder}
      />
    )
  }

  const hasDelivery = !!profile.deliveryType

  return (
    <div className="app-shell" style={{ background: '#F3F4F1' }}>
      {/* Header (gradient) */}
      <div className="sw-header" style={{ padding: '18px 20px 28px' }}>
        {/* Top row: logo + cart */}
        <div className="flex items-center justify-between mb-5">
          <img src="/logo.svg" alt="SWAYAM" style={{ height: 24, width: 'auto' }} />
          <button
            aria-label="Cart"
            onClick={() => cartCount > 0 && setScreen('checkout')}
            className="relative w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.14)' }}
          >
            <IconCart size={20} stroke="#fff" />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[11px] font-800 flex items-center justify-center"
                style={{ background: '#FAF6EE', color: '#1F4D33', border: '2px solid #2C4A35' }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        <h1 className="text-white font-800 text-[28px] leading-tight tracking-tight">{profile.businessName}</h1>
        <p className="text-white/70 text-[13px] font-600 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} · {items.length} item{items.length > 1 ? 's' : ''} available
        </p>

        {/* Feature pill (Freshly made | Local delivery) */}
        <div className="mt-3 inline-flex items-center bg-white/10 rounded-full pl-3 pr-3 py-1.5 backdrop-blur">
          {profile.isPerishable && (
            <span className="flex items-center gap-1.5 text-white text-[12px] font-700 pr-3">
              <IconStar size={13} stroke="#fff" />
              Freshly made
            </span>
          )}
          {profile.isPerishable && hasDelivery && (
            <span className="h-3.5 w-px bg-white/30" />
          )}
          {hasDelivery && (
            <span className="flex items-center gap-1.5 text-white text-[12px] font-700 pl-3">
              <IconBike size={13} stroke="#fff" />
              Local delivery
            </span>
          )}
        </div>
      </div>

      {/* White panel (rounded top, overlapping header) */}
      <div
        className="flex-1 flex flex-col -mt-4 bg-[#F3F4F1] overflow-hidden"
        style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
      >
        {/* Category tabs */}
        <div className="overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-2 px-4 pt-4 pb-2 w-max">
            {categories.map(cat => {
              const active = cat === activeCategory
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="text-[14px] font-800 px-4 py-2 rounded-full whitespace-nowrap transition-colors"
                  style={
                    active
                      ? { background: '#1F4D33', color: '#fff' }
                      : { background: 'transparent', color: '#6B7280' }
                  }
                >
                  {cat === 'All' ? 'All Items' : cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Products list */}
        <div className="flex-1 overflow-y-auto px-3 pt-2 pb-32 relative">
          <div className="flex flex-col gap-3">
            {visibleItems.map((item, idx) => (
              <ProductCard
                key={item.id}
                item={item}
                qty={cart[item.id] || 0}
                onAdd={addToCart}
                onRemove={removeFromCart}
                onSubscribe={(it) => setSubscribeCtx({ item: it })}
                onEditSubscription={(it, sub) => setSubscribeCtx({ item: it, existing: sub })}
                isBestseller={activeCategory === 'All' && idx === 0}
                subscription={subscriptionByItemId[item.id]}
              />
            ))}
            {visibleItems.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-12">No items in this category.</div>
            )}
          </div>
        </div>

        {/* Cart bar */}
        <CartBar
          cart={cart}
          items={items}
          onCheckout={() => setScreen('checkout')}
        />
      </div>

      {/* Subscribe modal */}
      {subscribeCtx && (
        <SubscribeModal
          item={subscribeCtx.item}
          existing={subscribeCtx.existing}
          onClose={() => setSubscribeCtx(null)}
          onConfirm={handleConfirmSubscription}
          onRemove={handleRemoveSubscription}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className="absolute left-1/2 z-[90] -translate-x-1/2 px-4 py-2.5 rounded-full text-white text-[13px] font-700 shadow-lg"
          style={{ bottom: 96, background: '#1F4D33' }}
        >
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
