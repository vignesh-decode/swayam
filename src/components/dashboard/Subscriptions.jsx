import { useState, useMemo, useEffect } from 'react'
import { useApp, A } from '../../context/AppContext'
import {
  matchesFrequency,
  getUpcomingDeliveries,
  monthlyValue,
  formatFrequencyLong,
  computeNextDelivery,
} from '../../data/mockSubscriptions'

// ─── Decorative blob configs (echoes OrderBuckets) ──────────────────────────
const BLOBS = {
  active:    [{ w: 60, h: 60, color: 'var(--sw-blob-teal)', top: -16, right: -10 }],
  paused:    [{ w: 56, h: 56, color: 'var(--sw-blob-sand)', bottom: -14, right: -10 }],
  cancelled: [{ w: 64, h: 64, color: 'var(--sw-blob-pink)', bottom: -18, right: -12 }],
  calendar:  [{ w: 58, h: 58, color: 'var(--sw-blob-teal)', top: -14, right: -10 }],
}

function Blobs({ config }) {
  return (config || []).map((b, i) => (
    <div key={i} className="sw-blob" style={{ width: b.w, height: b.h, background: b.color, top: b.top, bottom: b.bottom, right: b.right, left: b.left }} />
  ))
}

// ─── Status badge ───────────────────────────────────────────────────────────
const STATUS_STYLES = {
  active:    { bg: '#dcfce7', color: '#15803d', label: 'Active' },
  paused:    { bg: '#fef3c7', color: '#b45309', label: 'Paused' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.active
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 50, background: s.bg, color: s.color,
      letterSpacing: '0.02em',
    }}>{s.label}</span>
  )
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmtMoney = v => v >= 1000 ? `₹${Math.round(v / 100) / 10}k` : `₹${v}`
const fmtINR = v => `₹${v.toLocaleString('en-IN')}`

function formatDateLabel(date) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  const diff = Math.round((d - today) / (24 * 60 * 60 * 1000))
  const dm = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  if (diff === 0) return `Today · ${dm}`
  if (diff === 1) return `Tomorrow · ${dm}`
  const weekday = d.toLocaleDateString('en-IN', { weekday: 'short' })
  return `${weekday} · ${dm}`
}

// ─── Tabs (Customers / Calendar) ────────────────────────────────────────────
const SUB_TABS = [
  { id: 'customers', label: 'Customers' },
  { id: 'calendar',  label: 'Calendar'  },
]

function TabSwitcher({ tab, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#F0F0EC', borderRadius: 12, padding: 3, marginBottom: 16 }}>
      {SUB_TABS.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            flex: 1, padding: '9px 0', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: tab === t.id ? '#fff' : 'transparent',
            color: tab === t.id ? '#243928' : '#8A8A82',
            boxShadow: tab === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── Filter chips (active / paused / cancelled / all) ───────────────────────
const FILTERS = [
  { id: 'all',       label: 'All' },
  { id: 'active',    label: 'Active' },
  { id: 'paused',    label: 'Paused' },
  { id: 'cancelled', label: 'Cancelled' },
]

function FilterChips({ value, onChange, counts }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
      {FILTERS.map(f => {
        const active = value === f.id
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            style={{
              flexShrink: 0,
              padding: '7px 14px',
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: active ? 'none' : '1px solid #E5E7EB',
              background: active ? '#243928' : '#fff',
              color: active ? '#fff' : '#374151',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {f.label}{counts[f.id] != null && ` · ${counts[f.id]}`}
          </button>
        )
      })}
    </div>
  )
}

// ─── Subscription card (row in Customers tab) ───────────────────────────────
function SubscriptionCard({ sub, onTap }) {
  const blobKey = sub.status === 'cancelled' ? 'cancelled' : sub.status === 'paused' ? 'paused' : 'active'

  return (
    <button
      onClick={() => onTap(sub.id)}
      className="sw-card"
      style={{
        width: '100%', textAlign: 'left', cursor: 'pointer',
        marginBottom: 10, border: 'none', display: 'block',
        padding: 16,
      }}
    >
      <Blobs config={BLOBS[blobKey]} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Thumb */}
          <img
            src={sub.itemImage}
            alt={sub.itemName}
            style={{
              width: 54, height: 54, borderRadius: 12, objectFit: 'cover',
              background: '#F3F4F6', flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1A', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {sub.customerName}
              </p>
              <StatusBadge status={sub.status} />
            </div>
            <p style={{ fontSize: 12, color: '#6B6B67', lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {sub.qty} × {sub.itemName}
            </p>
            <p style={{ fontSize: 12, color: '#3D5E30', fontWeight: 600, marginTop: 4 }}>
              {formatFrequencyLong(sub)}
            </p>
          </div>
        </div>

        {/* Bottom row: monthly value */}
        <div style={{
          marginTop: 12, paddingTop: 12, borderTop: '1px solid #F0F0EC',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 11, color: '#8A8A82', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            Monthly value
          </span>
          <span style={{
            fontSize: 15, fontWeight: 800, color: sub.status === 'cancelled' ? '#9CA3AF' : '#243928',
            fontVariantNumeric: 'tabular-nums',
            textDecoration: sub.status === 'cancelled' ? 'line-through' : 'none',
          }}>
            {fmtINR(monthlyValue(sub))}
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Customers tab ──────────────────────────────────────────────────────────
function CustomersTab({ subscriptions, onSelect }) {
  const [filter, setFilter] = useState('active')

  const counts = useMemo(() => ({
    all: subscriptions.length,
    active:    subscriptions.filter(s => s.status === 'active').length,
    paused:    subscriptions.filter(s => s.status === 'paused').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
  }), [subscriptions])

  const filtered = useMemo(() => {
    if (filter === 'all') return subscriptions
    return subscriptions.filter(s => s.status === filter)
  }, [subscriptions, filter])

  // Sort active first, then by monthly value desc
  const sorted = useMemo(() => {
    const rank = { active: 0, paused: 1, cancelled: 2 }
    return [...filtered].sort((a, b) => {
      const rd = rank[a.status] - rank[b.status]
      if (rd !== 0) return rd
      return monthlyValue(b) - monthlyValue(a)
    })
  }, [filtered])

  return (
    <div>
      <FilterChips value={filter} onChange={setFilter} counts={counts} />

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>
            No {filter === 'all' ? '' : filter} subscriptions
          </p>
        </div>
      ) : (
        sorted.map(sub => (
          <SubscriptionCard key={sub.id} sub={sub} onTap={onSelect} />
        ))
      )}
    </div>
  )
}

// ─── Calendar tab ───────────────────────────────────────────────────────────
function CalendarTab({ subscriptions }) {
  // Build a day-keyed map of upcoming deliveries (active subs, next 28 days)
  const groups = useMemo(() => {
    const map = new Map()
    const today = new Date(); today.setHours(0, 0, 0, 0)
    subscriptions.filter(s => s.status === 'active').forEach(sub => {
      getUpcomingDeliveries(sub, today, 28).forEach(d => {
        const key = d.toDateString()
        if (!map.has(key)) map.set(key, { date: d, items: [] })
        map.get(key).items.push(sub)
      })
    })
    return Array.from(map.values()).sort((a, b) => a.date - b.date)
  }, [subscriptions])

  if (groups.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>No deliveries scheduled in the next 28 days</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {groups.map(g => {
        const totalQty = g.items.reduce((s, sub) => s + sub.qty, 0)
        return (
          <div key={g.date.toISOString()} className="sw-card" style={{ marginBottom: 0, padding: 16 }}>
            <Blobs config={BLOBS.calendar} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A' }}>
                  {formatDateLabel(g.date)}
                </p>
                <p style={{ fontSize: 11, color: '#6B6B67', fontWeight: 600 }}>
                  {totalQty} item{totalQty !== 1 ? 's' : ''} · {g.items.length} order{g.items.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.items.map(sub => (
                  <div key={sub.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: 8, background: '#F8F8F4', borderRadius: 10,
                  }}>
                    <img
                      src={sub.itemImage}
                      alt={sub.itemName}
                      style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', background: '#F3F4F6', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.qty} × {sub.itemName}
                      </p>
                      <p style={{ fontSize: 11, color: '#6B6B67', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sub.customerName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Detail modal ───────────────────────────────────────────────────────────
function DetailModal({ sub, onClose, onUpdateStatus }) {
  // Animate in
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 220)
  }

  if (!sub) return null

  const upcoming = sub.status === 'active'
    ? getUpcomingDeliveries(sub, new Date(), 28).slice(0, 5)
    : []

  return (
    <div
      onClick={e => e.target === e.currentTarget && close()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 200,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.22s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 430,
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        maxHeight: '92dvh',
        overflowY: 'auto',
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid #F0F0EC',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A8A82', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Subscription
            </p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1A', letterSpacing: '-0.01em', lineHeight: 1.2 }}>
              {sub.customerName}
            </p>
            <p style={{ fontSize: 13, color: '#6B6B67', marginTop: 4 }}>{sub.customerPhone}</p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#F0F0EC', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1C1C1A" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 18px 20px' }}>
          {/* Address */}
          {sub.customerAddress && (
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 16 }}>
              {sub.customerAddress}
            </p>
          )}

          {/* Status + monthly value */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <StatusBadge status={sub.status} />
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#8A8A82', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Monthly value
              </p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#243928', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
                {fmtINR(monthlyValue(sub))}
              </p>
            </div>
          </div>

          {/* Item card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 12, background: '#F8F8F4', borderRadius: 14,
            marginBottom: 16,
          }}>
            <img src={sub.itemImage} alt={sub.itemName} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A' }}>
                {sub.qty} × {sub.itemName}
              </p>
              <p style={{ fontSize: 12, color: '#6B6B67', marginTop: 2 }}>
                {fmtINR(sub.itemPrice)} {sub.itemUnit ? `· ${sub.itemUnit}` : ''}
              </p>
            </div>
          </div>

          {/* Frequency */}
          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A8A82', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Schedule
            </p>
            <p style={{ fontSize: 14, color: '#1C1C1A', fontWeight: 600 }}>
              {formatFrequencyLong(sub)}
            </p>
          </div>

          {/* Upcoming */}
          {sub.status === 'active' && (
            <div style={{ marginBottom: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#8A8A82', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
                Next deliveries
              </p>
              {upcoming.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9CA3AF' }}>No deliveries in the next 28 days</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {upcoming.map((d, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', background: '#F8F8F4', borderRadius: 10,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A' }}>
                        {formatDateLabel(d)}
                      </span>
                      <span style={{ fontSize: 12, color: '#3D5E30', fontWeight: 700 }}>
                        {sub.qty} {sub.qty === 1 ? 'unit' : 'units'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Started / paused / cancelled meta */}
          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 18 }}>
            Started {new Date(sub.startedAt || sub.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            {sub.pausedAt && ` · Paused ${new Date(sub.pausedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
            {sub.cancelledAt && ` · Cancelled ${new Date(sub.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            {sub.status === 'active' && (
              <>
                <button
                  onClick={() => { onUpdateStatus(sub.id, 'paused'); close() }}
                  style={{
                    flex: 1, background: '#fff', color: '#B45309',
                    border: '1.5px solid #FCD34D', borderRadius: 12,
                    padding: '13px 16px', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Pause
                </button>
                <button
                  onClick={() => { onUpdateStatus(sub.id, 'cancelled'); close() }}
                  style={{
                    flex: 1, background: '#fff', color: '#B91C1C',
                    border: '1.5px solid #FCA5A5', borderRadius: 12,
                    padding: '13px 16px', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel Subscription
                </button>
              </>
            )}
            {sub.status === 'paused' && (
              <>
                <button
                  onClick={() => { onUpdateStatus(sub.id, 'active'); close() }}
                  style={{
                    flex: 1, background: '#243928', color: '#fff',
                    border: 'none', borderRadius: 12,
                    padding: '13px 16px', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Resume
                </button>
                <button
                  onClick={() => { onUpdateStatus(sub.id, 'cancelled'); close() }}
                  style={{
                    flex: 1, background: '#fff', color: '#B91C1C',
                    border: '1.5px solid #FCA5A5', borderRadius: 12,
                    padding: '13px 16px', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Cancel Subscription
                </button>
              </>
            )}
            {sub.status === 'cancelled' && (
              <button
                onClick={() => { onUpdateStatus(sub.id, 'active'); close() }}
                style={{
                  flex: 1, background: '#243928', color: '#fff',
                  border: 'none', borderRadius: 12,
                  padding: '13px 16px', fontWeight: 700, fontSize: 14,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Reactivate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Header stats (rendered inline in the page, below the gradient header) ──
// Three KPI cards matching dashboard's `.sw-stat-card` style.
export function SubscriptionStats({ subscriptions }) {
  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'active')
    const monthlyTotal = active.reduce((s, sub) => s + monthlyValue(sub), 0)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const dueToday = active.filter(s => matchesFrequency(s, today)).length
    return { activeCount: active.length, monthlyTotal, dueToday }
  }, [subscriptions])

  const items = [
    { value: stats.activeCount,         label: 'Active subscriptions' },
    { value: fmtMoney(stats.monthlyTotal), label: 'Monthly revenue' },
    { value: stats.dueToday,            label: 'Due today' },
  ]

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {items.map(s => (
        <div key={s.label} className="sw-stat-card">
          <p style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1A', lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{s.value}</p>
          <p style={{ fontSize: 11, color: '#6B6B67', marginTop: 6, lineHeight: 1.3, fontWeight: 500 }}>{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main export — the tab body rendered inside Dashboard ───────────────────
export default function Subscriptions() {
  const { state, dispatch } = useApp()
  const { subscriptions } = state
  const [tab, setTab] = useState('customers')
  const [selectedId, setSelectedId] = useState(null)

  const selected = useMemo(
    () => subscriptions.find(s => s.id === selectedId) || null,
    [subscriptions, selectedId]
  )

  function updateStatus(id, status) {
    const changes = { status }
    const now = new Date().toISOString()
    if (status === 'paused')    changes.pausedAt    = now
    if (status === 'cancelled') changes.cancelledAt = now
    if (status === 'active') {
      // Resuming: recompute next delivery, clear paused/cancelled timestamps
      changes.pausedAt = null
      changes.cancelledAt = null
      const sub = subscriptions.find(s => s.id === id)
      if (sub) {
        const next = computeNextDelivery({ ...sub, status: 'active' }, new Date())
        changes.nextDeliveryAt = next ? next.toISOString() : null
      }
    }
    dispatch({ type: A.UPDATE_SUBSCRIPTION, payload: { id, changes } })
  }

  return (
    <div style={{ padding: '16px 16px 130px' }}>
      <TabSwitcher tab={tab} onChange={setTab} />

      {tab === 'customers' && (
        <CustomersTab subscriptions={subscriptions} onSelect={setSelectedId} />
      )}
      {tab === 'calendar' && (
        <CalendarTab subscriptions={subscriptions} />
      )}

      {selected && (
        <DetailModal
          sub={selected}
          onClose={() => setSelectedId(null)}
          onUpdateStatus={updateStatus}
        />
      )}
    </div>
  )
}
