import { useApp, A } from '../../context/AppContext'

// ─── Decorative blob configs per bucket ──────────────────────────────────────
const BLOB_CONFIGS = {
  today: [
    { w: 72, h: 72, color: 'var(--sw-blob-teal)', top: -18, right: 18 },
    { w: 56, h: 56, color: 'var(--sw-blob-sand)', top: 10,  right: -10 },
  ],
  toPrepare: [
    { w: 60, h: 60, color: 'var(--sw-blob-teal)', top: -16, right: -10 },
  ],
  preparing: [
    { w: 64, h: 64, color: 'var(--sw-blob-sand)', bottom: -16, right: -10 },
  ],
  ready: [
    { w: 60, h: 60, color: 'var(--sw-blob-teal)', bottom: -14, right: -12 },
  ],
  outForDelivery: [
    { w: 60, h: 60, color: 'var(--sw-blob-sand)', top: -14, right: -10 },
  ],
  payPending: [
    { w: 76, h: 76, color: 'var(--sw-blob-pink)', bottom: -20, right: -14 },
  ],
  complete: [
    { w: 58, h: 58, color: 'var(--sw-blob-teal)', bottom: -14, right: -10 },
  ],
}

function Blobs({ config }) {
  return config.map((b, i) => (
    <div key={i} className="sw-blob" style={{ width: b.w, height: b.h, background: b.color, top: b.top, bottom: b.bottom, right: b.right, left: b.left }} />
  ))
}

// ─── Big summary card — "Today's Orders" ─────────────────────────────────────
function TodayCard({ orders, onView }) {
  const todayStr = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.placedAt).toDateString() === todayStr)

  let summaryBold = ''
  let summaryRest = ''
  if (todayOrders.length === 0) {
    summaryBold = 'No orders'
    summaryRest = ' yet today'
  } else {
    const totalItems = todayOrders.reduce((s, o) => s + o.items.reduce((si, i) => si + i.qty, 0), 0)
    summaryBold = `${totalItems} items total`
    summaryRest = `  ·  ${todayOrders.length} orders`
  }

  return (
    <button
      data-ftu="today-card"
      onClick={onView}
      className="sw-card"
      style={{ width: '100%', textAlign: 'left', cursor: 'pointer', marginBottom: 12, border: 'none', display: 'block' }}
    >
      <Blobs config={BLOB_CONFIGS.today} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontSize: 18, color: '#1C1C1A', lineHeight: 1.3, marginBottom: 8, letterSpacing: '-0.01em' }}>
          <strong style={{ fontWeight: 700 }}>{summaryBold}</strong>
          <span style={{ fontWeight: 400, color: '#4B5048' }}>{summaryRest}</span>
        </p>
        <p className="sw-section-label" style={{ marginBottom: 0 }}>Today's Summary</p>
      </div>
    </button>
  )
}

// ─── Bucket grid tile ─────────────────────────────────────────────────────────
function BucketTile({ label, count, amount, desc, blobKey, onView }) {
  return (
    <button
      onClick={onView}
      className="sw-bucket"
      style={{ textAlign: 'left', cursor: 'pointer', border: 'none' }}
    >
      <Blobs config={BLOB_CONFIGS[blobKey] || []} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Big number — count only, no denominator */}
        <p style={{ fontSize: 26, fontWeight: 700, color: '#1C1C1A', lineHeight: 1, marginBottom: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
          {count}
        </p>
        {/* Optional ₹ amount (used by Delivered · Pay Pending) */}
        {amount != null && (
          <p style={{ fontSize: 13, fontWeight: 600, color: '#C2410C', marginTop: 2, marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
            ₹{amount.toLocaleString('en-IN')}
          </p>
        )}
        <p style={{ fontSize: 12, color: '#6B6B67', marginBottom: 12, lineHeight: 1.4 }}>{desc}</p>
        <p className="sw-section-label" style={{ marginBottom: 0 }}>{label}</p>
      </div>
    </button>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function OrderBuckets() {
  const { state, dispatch } = useApp()
  const { orders, profile, todaysDrop } = state

  const goOrders = (filter = null) => {
    dispatch({ type: A.SET_ORDERS_FILTER, payload: filter })
    dispatch({ type: A.SET_DASHBOARD_TAB, payload: 'orders' })
  }

  // Filter to today — buckets reflect the current day's pipeline.
  const todayStr = new Date().toDateString()
  const todayOrders = orders.filter(o => new Date(o.placedAt).toDateString() === todayStr)
  const byStatus = (s) => todayOrders.filter(o => o.status === s)

  const toPrepare      = byStatus('new')
  const preparing      = byStatus('preparing')
  const ready          = byStatus('ready')
  const outForDelivery = byStatus('out_for_delivery')
  // Delivered but not yet paid (paymentMode='later' on a delivered order).
  const payPending     = todayOrders.filter(o => o.status === 'delivered' && o.paymentMode === 'later')
  const payPendingAmt  = payPending.reduce((s, o) => s + o.total, 0)
  // Fully complete = delivered+paid. With our model: paid-up-front orders advance straight to 'completed',
  // and pay-later orders move to 'completed' once the user marks them paid.
  const fullyComplete  = todayOrders.filter(o => o.status === 'completed')

  return (
    <div>
      <p className="sw-section-label">Orders</p>

      {/* Big summary card */}
      <TodayCard orders={orders} onView={() => goOrders(null)} />

      {/* 2 × 3 bucket grid — independent counts, no denominator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <BucketTile label="To Prepare"           count={toPrepare.length}      desc="Received, not started"     blobKey="toPrepare"      onView={() => goOrders('new')} />
        <BucketTile label="Preparing"            count={preparing.length}      desc="Currently being made"      blobKey="preparing"      onView={() => goOrders('preparing')} />
        <BucketTile label="Ready to Dispatch"    count={ready.length}          desc="Packed, awaiting pickup"   blobKey="ready"          onView={() => goOrders('ready')} />
        <BucketTile label="Out for Delivery"     count={outForDelivery.length} desc="On the way"                blobKey="outForDelivery" onView={() => goOrders('out_for_delivery')} />
        <BucketTile label="Delivered · Pay Pending" count={payPending.length} amount={payPendingAmt} desc="Follow up for payment" blobKey="payPending" onView={() => goOrders('pay_pending')} />
        <BucketTile label="Fully Complete"       count={fullyComplete.length}  desc="Delivered & paid"          blobKey="complete"       onView={() => goOrders('completed')} />
      </div>

      {/* Live stock tracker — only when drop is active */}
      {todaysDrop.isActive && todaysDrop.items.length > 0 && (
        <div className="sw-card" style={{ marginTop: 12 }}>
          <p className="sw-section-label">{profile.isPerishable ? 'Remaining Stock' : 'Live Inventory'}</p>
          {todaysDrop.items.map(item => {
            const rem = item.remaining ?? item.todayQty
            const pct = Math.round((rem / item.todayQty) * 100)
            return (
              <div key={item.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{item.name}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#243928', fontVariantNumeric: 'tabular-nums' }}>{rem}/{item.todayQty}</p>
                </div>
                <div style={{ height: 5, background: '#F3F4F6', borderRadius: 50, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 50, width: `${pct}%`, background: pct > 50 ? '#3D5E30' : pct > 20 ? '#d97706' : '#ef4444', transition: 'width 0.5s' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
