import { useState, useEffect, useRef } from 'react'
import { useApp, A } from '../../context/AppContext'
import OrderBuckets from './OrderBuckets'
import WeeklyChart from './WeeklyChart'
import { CustomerList, PaymentStatus } from './WeeklyChart'
import FeedbackWidget from '../feedback/FeedbackWidget'
import DashboardFTU from './DashboardFTU'
import Subscriptions, { SubscriptionStats } from './Subscriptions'

const FILTER_LABELS = {
  new: 'To Prepare',
  preparing: 'Preparing',
  ready: 'Ready to Dispatch',
  out_for_delivery: 'Out for Delivery',
  pay_pending: 'Pay Pending',
  completed: 'Fully Complete',
}

// ─── SWAYAM logo ──────────────────────────────────────────────────────────────
function SwayamLogo() {
  return (
    <img
      src="/logo.svg"
      alt="SWAYAM"
      style={{ height: 26, width: 'auto', display: 'block' }}
    />
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
const TAB_TITLES = { orders: 'Orders', analytics: 'Analytics', customers: 'Customers', history: 'Orders history', subscriptions: 'Subscriptions' }

function DashboardHeader({ profile, orders, subscriptions, todaysDrop, dashboardTab, ordersFilter, onBack, onOpenMenu }) {
  // Subscriptions tab — same compact-with-back layout, but with three KPI cards
  // underneath (mirrors the home header's stat strip).
  if (dashboardTab === 'subscriptions') {
    return (
      <div className="sw-header" style={{ paddingTop: 52, paddingBottom: 20, paddingLeft: 20, paddingRight: 20, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <SwayamLogo />
          <button onClick={onOpenMenu} aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', padding: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.9)', padding: 4, marginLeft: -4, display: 'flex' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            Subscriptions
          </h1>
        </div>
        <SubscriptionStats subscriptions={subscriptions} />
      </div>
    )
  }

  // Compact header with back arrow when not on the home tab
  if (dashboardTab !== 'home') {
    return (
      <div className="sw-header" style={{ paddingTop: 52, paddingBottom: 20, paddingLeft: 20, paddingRight: 20, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <SwayamLogo />
          <button onClick={onOpenMenu} aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', padding: 4 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.9)', padding: 4, marginLeft: -4, display: 'flex' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <h1 style={{ color: '#fff', fontSize: 18, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {dashboardTab === 'orders' && ordersFilter ? (FILTER_LABELS[ordersFilter] || 'Orders') : (TAB_TITLES[dashboardTab] || dashboardTab)}
          </h1>
        </div>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile.name?.split(' ')[0] || 'there'

  const todayStr = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.placedAt).toDateString() === todayStr)

  // Cash collected = paid (paymentMode='now') AND delivered/completed today.
  const cashCollected = todayOrders
    .filter(o => o.paymentMode === 'now' && (o.status === 'delivered' || o.status === 'completed'))
    .reduce((s, o) => s + o.total, 0)

  // Pending cash = delivered today but not yet paid (paymentMode='later' AND status='delivered').
  const pendingCash = todayOrders
    .filter(o => o.paymentMode === 'later' && o.status === 'delivered')
    .reduce((s, o) => s + o.total, 0)

  const fmtMoney = v => v >= 1000 ? `₹${Math.round(v / 100) / 10}k` : `₹${v}`

  const stats = [
    { value: todayOrders.length,    label: 'Total orders'   },
    { value: fmtMoney(cashCollected), label: 'Cash collected' },
    { value: fmtMoney(pendingCash),   label: 'Pending cash'   },
  ]

  return (
    <div className="sw-header" style={{ paddingTop: 52, paddingBottom: 20, paddingLeft: 20, paddingRight: 20, position: 'sticky', top: 0, zIndex: 40 }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <SwayamLogo />
        <button onClick={onOpenMenu} aria-label="Menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.85)', padding: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Greeting */}
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 4 }}>{greeting}</p>
      <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.01em' }}>{firstName}</h1>

      {/* Stat cards */}
      <div data-ftu="header-stats" style={{ display: 'flex', gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} className="sw-stat-card">
            <p style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1A', lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#6B6B67', marginTop: 6, lineHeight: 1.3, fontWeight: 500 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Home tab ─────────────────────────────────────────────────────────────────
function HomeTab() {
  const { state } = useApp()
  const { orders } = state

  // Pay-later orders that have been delivered but not yet paid (need active follow-up).
  const pending = orders.filter(o => o.paymentMode === 'later' && o.status === 'delivered')

  return (
    <div style={{ padding: '20px 16px 130px' }}>
      <OrderBuckets />

      {/* Pending payments */}
      <div data-ftu="pending-payments" style={{ marginTop: 24 }}>
        <p className="sw-section-label">Pending Payments</p>
        <div className="sw-card" style={{ minHeight: 90 }}>
          {/* blobs */}
          <div className="sw-blob" style={{ width: 85, height: 85, background: 'var(--sw-blob-pink)', bottom: -22, right: -14 }} />
          <div className="sw-blob" style={{ width: 58, height: 58, background: 'var(--sw-blob-sand)', bottom: 14, right: 52 }} />
          {pending.length === 0 ? (
            <p style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No events added</p>
          ) : pending.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, position: 'relative', zIndex: 1 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A' }}>{o.customerName}</p>
                <p style={{ fontSize: 11, color: '#6B6B67', marginTop: 2 }}>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#C2410C', fontVariantNumeric: 'tabular-nums' }}>₹{o.total}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Items aggregated view ────────────────────────────────────────────────────
function ItemsView({ orders }) {
  const [prepared, setPrepared] = useState({})

  const itemMap = {}
  orders.forEach(o => o.items.forEach(i => {
    if (!itemMap[i.id]) {
      itemMap[i.id] = { id: i.id, name: i.name, qty: 0, orderCount: 0, price: i.todayPrice }
    }
    itemMap[i.id].qty += i.qty
    itemMap[i.id].orderCount += 1
  }))
  const items = Object.values(itemMap).sort((a, b) => b.qty - a.qty)

  function updatePrepared(id, delta, total) {
    setPrepared(p => {
      const current = p[id] || 0
      const next = Math.max(0, Math.min(total, current + delta))
      return { ...p, [id]: next }
    })
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 14, color: '#9CA3AF' }}>No items to show</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(item => {
        const done = prepared[item.id] || 0
        const pending = item.qty - done
        const pct = Math.round((done / item.qty) * 100)
        const allDone = done >= item.qty

        return (
          <div key={item.id} className="sw-card" style={{ marginBottom: 0, padding: '14px 16px', opacity: allDone ? 0.6 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1A' }}>{item.name}</p>
                <p style={{ fontSize: 12, color: '#6B6B67', marginTop: 3 }}>
                  {item.orderCount} order{item.orderCount !== 1 ? 's' : ''} · ₹{item.price} each
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: allDone ? '#15803d' : '#243928', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                  {allDone ? '✓' : pending}
                </p>
                <p style={{ fontSize: 11, color: '#6B6B67', marginTop: 2 }}>{allDone ? 'done' : 'pending'}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, background: '#F0F0EC', borderRadius: 50, overflow: 'hidden', marginBottom: 10 }}>
              <div style={{
                height: '100%',
                borderRadius: 50,
                width: `${pct}%`,
                background: allDone ? '#15803d' : '#3D5E30',
                transition: 'width 0.3s',
              }} />
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontSize: 12, color: '#6B6B67', fontVariantNumeric: 'tabular-nums' }}>
                {done}/{item.qty} prepared
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[1, 5].map(step => (
                  <button
                    key={step}
                    onClick={() => updatePrepared(item.id, step, item.qty)}
                    disabled={done >= item.qty}
                    style={{
                      background: done >= item.qty ? '#F0F0EC' : '#243928',
                      color: done >= item.qty ? '#9CA3AF' : '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: done >= item.qty ? 'default' : 'pointer',
                    }}
                  >
                    +{step}
                  </button>
                ))}
                <button
                  onClick={() => updatePrepared(item.id, -1, item.qty)}
                  disabled={done <= 0}
                  style={{
                    background: done <= 0 ? '#F0F0EC' : '#fff',
                    color: done <= 0 ? '#9CA3AF' : '#6B6B67',
                    border: '1px solid #E5E7EB',
                    borderRadius: 8,
                    padding: '6px 10px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: done <= 0 ? 'default' : 'pointer',
                  }}
                >
                  −1
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Orders tab ───────────────────────────────────────────────────────────────
function OrdersTab() {
  const { state, dispatch, advanceOrder } = useApp()
  const { orders, ordersFilter } = state
  const [viewMode, setViewMode] = useState('items')

  const todayStr = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.placedAt).toDateString() === todayStr)

  let filtered = todayOrders
  if (ordersFilter === 'pay_pending') {
    filtered = todayOrders.filter(o => o.status === 'delivered' && o.paymentMode === 'later')
  } else if (ordersFilter) {
    filtered = todayOrders.filter(o => o.status === ordersFilter)
  }

  if (orders.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
        <span style={{ fontSize: 52, marginBottom: 14 }}>📭</span>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#1C1C1A', marginBottom: 6 }}>No orders yet</p>
        <p style={{ fontSize: 14, color: '#6B6B67' }}>Share your daily drop link to get orders</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 130px' }}>
      {/* Filter chip */}
      {ordersFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#243928', background: '#E8F5E9', padding: '5px 12px', borderRadius: 20 }}>
            {FILTER_LABELS[ordersFilter] || ordersFilter}
          </span>
          <button
            onClick={() => dispatch({ type: A.SET_ORDERS_FILTER, payload: null })}
            style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: 20, padding: '4px 10px', fontSize: 12, color: '#6B6B67', cursor: 'pointer' }}
          >
            Show all
          </button>
        </div>
      )}

      {/* View toggle — only for "all orders" (Today's Summary), not for bucket filters */}
      {!ordersFilter && (
        <div style={{ display: 'flex', background: '#F0F0EC', borderRadius: 12, padding: 3, marginBottom: 16 }}>
          {[{ id: 'items', label: 'By Items' }, { id: 'orders', label: 'By Orders' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === tab.id ? '#fff' : 'transparent',
                color: viewMode === tab.id ? '#243928' : '#8A8A82',
                boxShadow: viewMode === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {!ordersFilter && viewMode === 'items' ? (
        <ItemsView orders={filtered} />
      ) : (
        filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ fontSize: 14, color: '#9CA3AF' }}>No orders in this status</p>
          </div>
        ) : (
          filtered.map(o => <OrderCard key={o.id} order={o} onAdvance={advanceOrder} />)
        )
      )}
    </div>
  )
}

function OrderCard({ order, onAdvance }) {
  const nextLabelMap = {
    new:              'Mark Preparing',
    preparing:        'Mark Ready',
    ready:            'Mark Out for Delivery',
    out_for_delivery: 'Mark Delivered',
    delivered:        'Mark Paid',
    completed:        null,
  }
  const nextLabel = nextLabelMap[order.status]
  const sLabel = {
    new:              'New',
    preparing:        'Preparing',
    ready:            'Ready',
    out_for_delivery: 'Out for delivery',
    delivered:        'Pay pending',
    completed:        'Completed',
  }
  const sStyle = {
    new:              { bg: '#dbeafe', color: '#1d4ed8' },
    preparing:        { bg: '#fef3c7', color: '#b45309' },
    ready:            { bg: '#ede9fe', color: '#6d28d9' },
    out_for_delivery: { bg: '#ffedd5', color: '#c2410c' },
    delivered:        { bg: '#fee2e2', color: '#b91c1c' },
    completed:        { bg: '#dcfce7', color: '#15803d' },
  }
  const ss = sStyle[order.status] || sStyle.new

  return (
    <div className="sw-card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#1C1C1A' }}>{order.customerName}</p>
          <p style={{ fontSize: 11, color: '#9CA3AF' }}>{order.id}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: ss.bg, color: ss.color }}>{sLabel[order.status]}</span>
          <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
            {new Date(order.placedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      <div style={{ background: '#F5F5F3', borderRadius: 12, padding: 12, marginBottom: 12 }}>
        {order.items.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: '#374151' }}>{item.name} × {item.qty}</span>
            <span style={{ fontWeight: 600 }}>₹{item.todayPrice * item.qty}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #E5E7EB', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
          <span style={{ fontWeight: 800, color: '#2C4A35' }}>₹{order.total}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#6B6B67' }}>{order.paymentMode === 'now' ? '💳 Paid' : '⏳ Pay later'}</span>
        {nextLabel && (
          <button onClick={() => onAdvance(order.id)} style={{ background: '#243928', color: '#fff', fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
            {nextLabel} →
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Orders history tab ───────────────────────────────────────────────────────
function OrdersHistoryTab() {
  const { state, advanceOrder } = useApp()
  const { orders } = state
  const [dateFilter, setDateFilter] = useState('')  // YYYY-MM-DD, '' = all
  const [nameQuery, setNameQuery] = useState('')

  const fulfilled = orders.filter(o => o.status === 'completed')

  const q = nameQuery.trim().toLowerCase()
  const filtered = fulfilled.filter(o => {
    if (dateFilter) {
      const d = new Date(o.placedAt)
      const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      if (local !== dateFilter) return false
    }
    if (q && !o.customerName.toLowerCase().includes(q)) return false
    return true
  })

  const hasFilters = dateFilter || nameQuery

  return (
    <div style={{ padding: '16px 16px 130px' }}>
      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={nameQuery}
            onChange={e => setNameQuery(e.target.value)}
            placeholder="Search customer name"
            style={{
              width: '100%', padding: '11px 12px 11px 36px',
              border: '1px solid #E5E7EB', borderRadius: 12,
              fontSize: 14, background: '#fff', color: '#1C1C1A',
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{
            width: '100%', padding: '11px 12px',
            border: '1px solid #E5E7EB', borderRadius: 12,
            fontSize: 14, background: '#fff', color: dateFilter ? '#1C1C1A' : '#9CA3AF',
            outline: 'none', boxSizing: 'border-box',
          }}
        />
        {hasFilters && (
          <button
            onClick={() => { setDateFilter(''); setNameQuery('') }}
            style={{
              alignSelf: 'flex-start', background: 'none',
              border: '1px solid #E5E7EB', borderRadius: 20,
              padding: '4px 12px', fontSize: 12, color: '#6B6B67', cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <p style={{ fontSize: 12, color: '#6B6B67', marginBottom: 10 }}>
        {filtered.length} fulfilled order{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ fontSize: 14, color: '#9CA3AF' }}>
            {fulfilled.length === 0 ? 'No fulfilled orders yet' : 'No orders match your filters'}
          </p>
        </div>
      ) : (
        filtered.map(o => <OrderCard key={o.id} order={o} onAdvance={advanceOrder} />)
      )}
    </div>
  )
}

// ─── Analytics tab ────────────────────────────────────────────────────────────
function AnalyticsTab() {
  return (
    <div style={{ padding: '16px 16px 130px' }}>
      <div className="sw-card"><WeeklyChart /></div>
    </div>
  )
}

// ─── Customers tab ────────────────────────────────────────────────────────────
function CustomersTab() {
  return (
    <div style={{ padding: '16px 16px 130px' }}>
      <CustomerList />
    </div>
  )
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'home',      label: 'Home' },
  { id: 'orders',    label: 'Orders' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'customers', label: 'Customers' },
]

function NavIcon({ id, active }) {
  const c = active ? '#243928' : '#9ca3af'
  const w = active ? 2.5 : 1.8
  if (id === 'home') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  if (id === 'orders') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
  if (id === 'analytics') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
}

// ─── FAB nudge hint ──────────────────────────────────────────────────────────
function FabNudge() {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(true), 15 * 1000)
    return () => clearTimeout(timerRef.current)
  }, [])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 82,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 55,
      maxWidth: 340,
      width: 'calc(100% - 60px)',
      animation: 'nudgeBounce 2s ease-in-out infinite',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: '12px 16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: '1px solid #E5E7EB',
        position: 'relative',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>👇</span>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', lineHeight: 1.4 }}>
          Tap the button below to get started with your first daily drop!
        </p>
        <button
          onClick={() => setVisible(false)}
          style={{ position: 'absolute', top: 6, right: 8, background: 'none', border: 'none', color: '#9CA3AF', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: 2 }}
        >
          ×
        </button>
        {/* Arrow pointing down */}
        <div style={{
          position: 'absolute',
          bottom: -7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 14,
          height: 7,
          overflow: 'hidden',
        }}>
          <div style={{
            width: 10,
            height: 10,
            background: '#fff',
            border: '1px solid #E5E7EB',
            transform: 'rotate(45deg)',
            position: 'absolute',
            top: -6,
            left: 2,
            boxShadow: '2px 2px 4px rgba(0,0,0,0.08)',
          }} />
        </div>
      </div>
    </div>
  )
}

// ─── Side menu drawer ─────────────────────────────────────────────────────────
const MENU_ITEMS = [
  { id: 'profile',       label: 'Profile' },
  { id: 'customers',     label: 'Customers' },
  { id: 'subscriptions', label: 'Subscriptions' },
  { id: 'orders',        label: 'Orders history' },
  { id: 'settings',      label: 'Settings' },
  { id: 'logout',        label: 'Logout' },
]

function MenuIconSvg({ id }) {
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (id === 'profile')       return <svg {...props}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  if (id === 'customers')     return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  if (id === 'subscriptions') return <svg {...props}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
  if (id === 'orders')        return <svg {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  if (id === 'settings')      return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  return <svg {...props}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}

function SideMenu({ open, onClose, profile, onSelect }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.25s', zIndex: 90,
        }}
      />
      <aside
        role="dialog"
        aria-label="Menu"
        style={{
          position: 'absolute', top: 0, right: 0, bottom: 0,
          width: '82%', maxWidth: 320, background: '#fff', zIndex: 91,
          boxShadow: '-8px 0 30px rgba(0,0,0,0.18)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s ease',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '52px 20px 18px', borderBottom: '1px solid #F0F0EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1A', lineHeight: 1.2 }}>
              {profile.name || 'Your account'}
            </p>
            {profile.businessName && (
              <p style={{ fontSize: 12, color: '#6B6B67', marginTop: 3 }}>{profile.businessName}</p>
            )}
          </div>
          <button onClick={onClose} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B6B67', padding: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 24px' }}>
          {MENU_ITEMS.map(item => {
            const isLogout = item.id === 'logout'
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 14px', borderRadius: 12, border: 'none',
                  background: 'transparent', cursor: 'pointer', textAlign: 'left',
                  color: isLogout ? '#b91c1c' : '#1C1C1A',
                  fontSize: 15, fontWeight: 600,
                }}
              >
                <MenuIconSvg id={item.id} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { state, dispatch } = useApp()
  const { profile, dashboardTab, todaysDrop, orders, subscriptions, ordersFilter, showDashboardFTU } = state
  const [menuOpen, setMenuOpen] = useState(false)

  function handleMenuSelect(id) {
    setMenuOpen(false)
    if (id === 'customers') {
      dispatch({ type: A.SET_DASHBOARD_TAB, payload: 'customers' })
    } else if (id === 'orders') {
      dispatch({ type: A.SET_ORDERS_FILTER, payload: null })
      dispatch({ type: A.SET_DASHBOARD_TAB, payload: 'history' })
    } else if (id === 'subscriptions') {
      dispatch({ type: A.SET_DASHBOARD_TAB, payload: 'subscriptions' })
    }
    // profile, settings, logout: no destination yet
  }

  return (
    <div className="app-shell" style={{ background: 'var(--sw-surface)' }}>
      {showDashboardFTU && dashboardTab === 'home' && (
        <DashboardFTU onDone={() => dispatch({ type: A.DISMISS_DASHBOARD_FTU })} />
      )}

      <DashboardHeader
        profile={profile}
        orders={orders}
        subscriptions={subscriptions}
        todaysDrop={todaysDrop}
        dashboardTab={dashboardTab}
        ordersFilter={ordersFilter}
        onBack={() => {
          dispatch({ type: A.SET_ORDERS_FILTER, payload: null })
          dispatch({ type: A.SET_DASHBOARD_TAB, payload: 'home' })
        }}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} profile={profile} onSelect={handleMenuSelect} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {dashboardTab === 'home'          && <HomeTab />}
        {dashboardTab === 'orders'        && <OrdersTab />}
        {dashboardTab === 'analytics'     && <AnalyticsTab />}
        {dashboardTab === 'customers'     && <CustomersTab />}
        {dashboardTab === 'history'       && <OrdersHistoryTab />}
        {dashboardTab === 'subscriptions' && <Subscriptions />}
      </div>

      {/* FAB hint nudge */}
      {!showDashboardFTU && !todaysDrop.isActive && <FabNudge />}

      {/* FAB */}
      <button data-ftu="fab" className="sw-fab" onClick={() => { dispatch({ type: A.OPEN_DAILY_DROP }) }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        {todaysDrop.isActive ? "Edit today's drop" : 'What are you selling today?'}
      </button>

      {/* Feedback — only after FTU is done */}
      {!showDashboardFTU && <FeedbackWidget />}
    </div>
  )
}
