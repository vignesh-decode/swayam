import { useApp } from '../../context/AppContext'
import { Avatar, EmptyState } from '../shared/UI'

// ─── Weekly chart ─────────────────────────────────────────────────────────────
export function WeeklyChart() {
  const { state } = useApp()
  const { orders } = state

  // Build last 7 days data
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.toDateString(),
    }
  })

  const data = days.map(day => ({
    ...day,
    orders: orders.filter(o => new Date(o.placedAt).toDateString() === day.date).length,
    revenue: orders
      .filter(o => new Date(o.placedAt).toDateString() === day.date)
      .reduce((s, o) => s + o.total, 0),
  }))

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1)
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = data.reduce((s, d) => s + d.orders, 0)

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500">7-day revenue</p>
          <p className="font-800 text-2xl text-gray-900 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total orders</p>
          <p className="font-800 text-2xl text-gray-900 font-mono">{totalOrders}</p>
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-32">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full chart-bar"
              style={{
                height: `${Math.max((d.revenue / maxRevenue) * 100, d.revenue > 0 ? 8 : 2)}%`,
                background: i === 6 ? '#075E54' : '#dcfce7',
                minHeight: d.revenue > 0 ? 6 : 2,
              }}
            />
            <p className="text-xs text-gray-400">{d.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeeklyChart

// ─── Payment status ───────────────────────────────────────────────────────────
export function PaymentStatus({ orders }) {
  const paidOrders = orders.filter(o => o.paymentMode === 'now')
  const laterOrders = orders.filter(o => o.paymentMode === 'later' && o.status !== 'delivered')
  const paidAmount = paidOrders.reduce((s, o) => s + o.total, 0)
  const pendingAmount = laterOrders.reduce((s, o) => s + o.total, 0)

  if (orders.length === 0) {
    return (
      <div className="card p-4 text-center">
        <p className="text-sm text-gray-400">No payment data yet</p>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="card flex-1 p-4">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mb-2">
          <span className="text-sm">💳</span>
        </div>
        <p className="text-xs text-gray-500">Collected</p>
        <p className="font-800 text-lg text-gray-900 font-mono">₹{paidAmount.toLocaleString('en-IN')}</p>
        <p className="text-xs text-gray-400 mt-0.5">{paidOrders.length} orders</p>
      </div>
      <div className="card flex-1 p-4">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-2">
          <span className="text-sm">⏳</span>
        </div>
        <p className="text-xs text-gray-500">Pending</p>
        <p className="font-800 text-lg text-amber-700 font-mono">₹{pendingAmount.toLocaleString('en-IN')}</p>
        <p className="text-xs text-gray-400 mt-0.5">{laterOrders.length} orders</p>
      </div>
    </div>
  )
}

// ─── Customer list ────────────────────────────────────────────────────────────
export function CustomerList() {
  const { state } = useApp()
  const { orders, subscriptions } = state

  // Aggregate by customer name+phone
  const customerMap = {}
  orders.forEach(o => {
    const key = o.customerPhone || o.customerName
    if (!customerMap[key]) {
      customerMap[key] = {
        name: o.customerName,
        phone: o.customerPhone,
        orders: 0,
        total: 0,
        lastOrder: o.placedAt,
      }
    }
    customerMap[key].orders++
    customerMap[key].total += o.total
    if (o.placedAt > customerMap[key].lastOrder) customerMap[key].lastOrder = o.placedAt
  })

  // Subscribed-customer index — match by phone first, then name.
  const subscribedPhones = new Set()
  const subscribedNames = new Set()
  ;(subscriptions || []).forEach(s => {
    if (s.status === 'cancelled') return
    if (s.customerPhone) subscribedPhones.add(s.customerPhone)
    if (s.customerName)  subscribedNames.add(s.customerName)
  })

  // Promote subscribed customers who haven't ordered yet so they still appear.
  ;(subscriptions || []).forEach(s => {
    if (s.status === 'cancelled') return
    const key = s.customerPhone || s.customerName
    if (!customerMap[key]) {
      customerMap[key] = {
        name: s.customerName,
        phone: s.customerPhone,
        orders: 0,
        total: 0,
        lastOrder: s.startedAt || s.createdAt,
      }
    }
  })

  const customers = Object.values(customerMap).sort((a, b) => b.total - a.total)

  if (customers.length === 0) {
    return <EmptyState icon="👥" title="No customers yet" subtitle="Your customers will appear here once they place orders" />
  }

  return (
    <div className="card overflow-hidden">
      {customers.map((c, i) => {
        const isSubscribed = (c.phone && subscribedPhones.has(c.phone)) || subscribedNames.has(c.name)
        return (
          <div key={c.phone || c.name} className={`flex items-center gap-3 p-4 ${i < customers.length - 1 ? 'border-b border-gray-50' : ''}`}>
            <Avatar name={c.name} size={40} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-600 text-sm text-gray-900 truncate">{c.name}</p>
                {isSubscribed && <SubscribedBadge />}
              </div>
              <p className="text-xs text-gray-400">{c.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-700 text-brand-700">₹{c.total.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-400">
                {c.orders > 0 ? `${c.orders} order${c.orders > 1 ? 's' : ''}` : 'Subscriber'}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Subscribed badge (chip with repeat-circle icon) ─────────────────────────
function SubscribedBadge() {
  return (
    <span
      title="Subscribed customer"
      aria-label="Subscribed"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        background: '#E6EFE3',
        color: '#243928',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.04em',
        padding: '2px 7px 2px 5px',
        borderRadius: 999,
        flexShrink: 0,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
      </svg>
      SUB
    </span>
  )
}
