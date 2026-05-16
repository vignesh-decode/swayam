// ─── Subscription helpers + mock seed ────────────────────────────────────────
// All times are local-time. Dates without explicit time are interpreted as
// midnight of the local day.

const img = (seed, w = 400, h = 400) => `https://picsum.photos/seed/${seed}/${w}/${h}`

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// ─── Frequency match (does this subscription deliver on this date?) ─────────
export function matchesFrequency(sub, date) {
  const dow = date.getDay()
  switch (sub.frequency) {
    case 'daily':         return true
    case 'weekdays':      return dow >= 1 && dow <= 5
    case 'specific_days': return (sub.weekdays || []).includes(dow)
    case 'monthly':       return date.getDate() === (sub.monthlyDay || 1)
    case 'every_n_days': {
      if (!sub.startedAt || !sub.intervalDays) return false
      const start = new Date(sub.startedAt); start.setHours(0, 0, 0, 0)
      const d = new Date(date); d.setHours(0, 0, 0, 0)
      const diff = Math.round((d - start) / (24 * 60 * 60 * 1000))
      return diff >= 0 && diff % sub.intervalDays === 0
    }
    default: return false
  }
}

// ─── Upcoming deliveries within a date window ────────────────────────────────
export function getUpcomingDeliveries(sub, fromDate, days = 28) {
  if (sub.status !== 'active') return []
  const out = []
  const cursor = new Date(fromDate); cursor.setHours(0, 0, 0, 0)
  const end = new Date(cursor); end.setDate(end.getDate() + days)
  while (cursor < end) {
    if (matchesFrequency(sub, cursor)) out.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

// ─── Average deliveries per month (used for monthly recurring revenue) ──────
export function deliveriesPerMonth(sub) {
  switch (sub.frequency) {
    case 'daily':         return 30
    case 'weekdays':      return 22
    case 'specific_days': return (sub.weekdays?.length || 0) * 4.33
    case 'monthly':       return 1
    case 'every_n_days':  return sub.intervalDays ? 30 / sub.intervalDays : 0
    default:              return 0
  }
}

export function monthlyValue(sub) {
  return Math.round((sub.itemPrice || 0) * (sub.qty || 1) * deliveriesPerMonth(sub))
}

// ─── Human-readable frequency ────────────────────────────────────────────────
export function formatFrequencyLong(sub) {
  switch (sub.frequency) {
    case 'daily': return 'Every day'
    case 'weekdays': return 'Every weekday'
    case 'specific_days': {
      const wd = sub.weekdays || []
      if (wd.length === 0) return 'No days set'
      if (wd.length === 7) return 'Every day'
      return `Every ${wd.map(d => WEEKDAY_SHORT[d]).join(', ')}`
    }
    case 'monthly': {
      const n = sub.monthlyDay || 1
      const suffix = (n === 1 || n === 21 || n === 31) ? 'st'
        : (n === 2 || n === 22) ? 'nd'
        : (n === 3 || n === 23) ? 'rd' : 'th'
      return `On the ${n}${suffix} of every month`
    }
    case 'every_n_days': {
      const n = sub.intervalDays || 1
      return n === 1 ? 'Every day' : `Every ${n} days`
    }
    default: return ''
  }
}

// ─── Next delivery date helper ──────────────────────────────────────────────
export function computeNextDelivery(sub, fromDate = new Date()) {
  if (sub.status !== 'active') return null
  const cursor = new Date(fromDate); cursor.setHours(0, 0, 0, 0)
  for (let i = 0; i < 60; i++) {
    if (matchesFrequency(sub, cursor)) return new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
  }
  return null
}

// ─── Mock seed (baker context, 6 customers) ─────────────────────────────────
// Built relative to "now" so the calendar always shows live-looking data.
const now = new Date()
const isoDaysAgo = (n) => {
  const d = new Date(now); d.setDate(d.getDate() - n); return d.toISOString()
}

const seed = [
  {
    customerName: 'Ananya Krishnan',
    customerPhone: '+91 98201 11234',
    customerAddress: 'Flat 4B, Lotus Apartments, Koramangala',
    itemId: 'b3',
    itemName: 'Sourdough Loaf',
    itemPrice: 220,
    itemImage: img('sourdough'),
    itemUnit: 'per loaf',
    itemDescription: 'Country-style sourdough, 700g.',
    qty: 2,
    frequency: 'weekdays',
    status: 'active',
    startedAt: isoDaysAgo(42),
  },
  {
    customerName: 'The Sharma Family',
    customerPhone: '+91 98202 33456',
    customerAddress: '12 Jasmine Street, Indiranagar',
    itemId: 'b1',
    itemName: 'Chocolate Truffle Cake',
    itemPrice: 650,
    itemImage: img('choco-cake'),
    itemUnit: 'per cake',
    itemDescription: 'Rich dark chocolate ganache, 500g.',
    qty: 1,
    frequency: 'specific_days',
    weekdays: [0], // Sunday
    status: 'active',
    startedAt: isoDaysAgo(70),
  },
  {
    customerName: 'Kavita Iyer',
    customerPhone: '+91 98203 55678',
    customerAddress: '7 Banyan Tree Road, HSR Layout',
    itemId: 'b5',
    itemName: 'Brownies',
    itemPrice: 320,
    itemImage: img('brownies'),
    itemUnit: 'box of 9',
    itemDescription: 'Fudgy dark chocolate brownies.',
    qty: 1,
    frequency: 'monthly',
    monthlyDay: 1,
    status: 'active',
    startedAt: isoDaysAgo(120),
  },
  {
    customerName: 'Rohit Mehta',
    customerPhone: '+91 98204 77890',
    customerAddress: '305 Maple Heights, Whitefield',
    itemId: 'b3',
    itemName: 'Sourdough Loaf',
    itemPrice: 220,
    itemImage: img('sourdough'),
    itemUnit: 'per loaf',
    itemDescription: 'Country-style sourdough, 700g.',
    qty: 2,
    frequency: 'specific_days',
    weekdays: [1, 4], // Mon, Thu
    status: 'active',
    startedAt: isoDaysAgo(28),
  },
  {
    customerName: 'Priya Desai',
    customerPhone: '+91 98205 99012',
    customerAddress: '88 Lakeview Apts, Bellandur',
    itemId: 'b6',
    itemName: 'Banana Bread',
    itemPrice: 180,
    itemImage: img('bananabread'),
    itemUnit: 'per loaf',
    itemDescription: 'Moist banana bread with walnuts.',
    qty: 1,
    frequency: 'specific_days',
    weekdays: [6], // Saturday
    status: 'paused',
    startedAt: isoDaysAgo(56),
    pausedAt: isoDaysAgo(7),
  },
  {
    customerName: 'Vikram Singh',
    customerPhone: '+91 98206 10101',
    customerAddress: '22 Oak Residency, JP Nagar',
    itemId: 'b4',
    itemName: 'Almond Croissants',
    itemPrice: 280,
    itemImage: img('croissant'),
    itemUnit: 'pack of 4',
    itemDescription: 'Butter croissants filled with frangipane.',
    qty: 2,
    frequency: 'specific_days',
    weekdays: [0, 6], // Sat, Sun
    status: 'cancelled',
    startedAt: isoDaysAgo(90),
    cancelledAt: isoDaysAgo(14),
  },
]

export const MOCK_SUBSCRIPTIONS = seed.map((s, i) => {
  const createdAt = s.startedAt
  const next = computeNextDelivery(s, now)
  return {
    id: `SUB-MOCK-${i + 1}`,
    createdAt,
    nextDeliveryAt: next ? next.toISOString() : null,
    ...s,
  }
})
