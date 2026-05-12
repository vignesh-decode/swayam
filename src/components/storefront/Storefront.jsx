import { useState, useMemo } from 'react'
import { useApp, A } from '../../context/AppContext'
import { calcDeliveryFee, mockDistanceFromAddress } from '../../data/deliveryPartners'

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ item, qty, onAdd, onRemove }) {
  const remaining = item.remaining ?? item.todayQty
  const soldOut = remaining === 0

  return (
    <div className={`product-card ${soldOut ? 'opacity-50' : ''}`}>
      {item.image && !item.adHoc ? (
        <img src={item.image} alt={item.name} className="w-full h-36 object-cover bg-gray-100" />
      ) : (
        <div className="w-full h-36 bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
          <span className="text-5xl">🛍️</span>
        </div>
      )}
      <div className="p-3">
        <p className="font-700 text-gray-900 text-sm">{item.name}</p>
        {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{item.description}</p>}
        <div className="flex items-center justify-between mt-3">
          <p className="font-800 text-brand-700">₹{item.todayPrice}</p>
          {soldOut ? (
            <span className="badge bg-red-100 text-red-600">Sold out</span>
          ) : qty > 0 ? (
            <div className="flex items-center gap-2">
              <button className="qty-btn" onClick={() => onRemove(item.id)}>−</button>
              <span className="font-700 text-gray-900 w-5 text-center text-sm">{qty}</span>
              <button
                className="qty-btn"
                onClick={() => onAdd(item.id)}
                disabled={qty >= remaining}
              >+</button>
            </div>
          ) : (
            <button
              className="bg-brand-700 text-white text-xs font-700 px-4 py-2 rounded-xl"
              onClick={() => onAdd(item.id)}
            >
              Add
            </button>
          )}
        </div>
        {remaining < 5 && remaining > 0 && (
          <p className="text-xs text-red-500 mt-1.5 font-500">Only {remaining} left!</p>
        )}
      </div>
    </div>
  )
}

// ─── Cart summary bar ─────────────────────────────────────────────────────────
function CartBar({ cart, items, onCheckout }) {
  const totalItems = Object.values(cart).reduce((s, q) => s + q, 0)
  if (totalItems === 0) return null

  const subtotal = Object.entries(cart).reduce((s, [id, qty]) => {
    const item = items.find(i => i.id === id)
    return s + (item ? item.todayPrice * qty : 0)
  }, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 pb-6 z-50">
      <button
        onClick={onCheckout}
        className="btn-primary flex items-center justify-between px-5"
      >
        <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-700">{totalItems}</span>
        <span>Proceed to Checkout</span>
        <span className="font-800">₹{subtotal}</span>
      </button>
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
  const deliveryFee = profile.deliveryType === 'partner' && profile.deliveryPartner && distance > 0
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
          {profile.deliveryType === 'self' && (
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
  const { todaysDrop, profile, storefrontOrderId } = state

  const [cart, setCart] = useState({})
  const [screen, setScreen] = useState('catalog') // 'catalog' | 'checkout' | 'confirmation'

  const items = todaysDrop.items

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

  return (
    <div className="app-shell">
      {/* Storefront header */}
      <div className="sw-header" style={{ padding: '20px 20px 20px' }}>
        <div style={{ marginBottom: 14 }}>
          <img src="/logo.svg" alt="SWAYAM" style={{ height: 26, width: 'auto' }} />
        </div>
        <div>
          <h1 className="text-white font-800 text-xl leading-tight">{profile.businessName}</h1>
          <p className="text-white/60 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} · {items.length} item{items.length > 1 ? 's' : ''}
          </p>
        </div>
        {profile.deliveryType === 'partner' && profile.deliveryPartner && (
          <div className="mt-3 flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
            <span className="text-sm">{profile.deliveryPartner.logo}</span>
            <p className="text-white/80 text-xs">Delivery via {profile.deliveryPartner.name} · ₹{profile.deliveryPartner.baseFee}+</p>
          </div>
        )}
      </div>

      {/* Products grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <div className="grid grid-cols-2 gap-3">
          {items.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              qty={cart[item.id] || 0}
              onAdd={addToCart}
              onRemove={removeFromCart}
            />
          ))}
        </div>
      </div>

      {/* Cart bar */}
      <CartBar
        cart={cart}
        items={items}
        onCheckout={() => setScreen('checkout')}
      />
    </div>
  )
}
