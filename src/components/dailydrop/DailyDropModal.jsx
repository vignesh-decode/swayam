import { useState } from 'react'
import { useApp, A } from '../../context/AppContext'
import MarketingCard from './MarketingCard'

// ─── Product selector row ─────────────────────────────────────────────────────
function ProductRow({ product, selected, overrides, onChange, onToggle }) {
  const isSelected = selected.includes(product.id)

  return (
    <div className={`card mb-2 overflow-hidden transition-all ${isSelected ? 'ring-2 ring-brand-600' : ''}`}>
      <div
        className="flex items-center gap-3 p-3 cursor-pointer"
        onClick={() => onToggle(product.id)}
      >
        <div className={`check-circle flex-shrink-0 ${isSelected ? 'checked' : ''}`}>
          {isSelected && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <img
          src={product.image}
          alt={product.name}
          className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-600 text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-400 truncate">{product.description}</p>
        </div>
        <p className="text-sm font-700 text-brand-700 flex-shrink-0">₹{product.price}</p>
      </div>

      {isSelected && (
        <div className="border-t border-gray-100 bg-surface px-3 py-3 flex gap-3 animate-fade-in">
          <div className="flex-1">
            <label className="text-xs text-gray-500 font-500 block mb-1">Today's price (₹)</label>
            <input
              type="number"
              className="input-field py-2 text-sm"
              value={overrides[product.id]?.price ?? product.price}
              onChange={e => onChange(product.id, 'price', +e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 font-500 block mb-1">Quantity available</label>
            <input
              type="number"
              className="input-field py-2 text-sm"
              value={overrides[product.id]?.qty ?? product.inStock}
              onChange={e => onChange(product.id, 'qty', +e.target.value)}
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

  return (
    <div className="mt-4">
      <p className="text-xs font-600 text-gray-500 uppercase tracking-wider mb-3">
        ➕ Add item not in your catalog
      </p>
      <div className="card p-4 mb-3">
        <div className="flex flex-col gap-3">
          <input
            className="input-field"
            placeholder="Product name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <div className="flex gap-3">
            <input
              type="number"
              className="input-field flex-1"
              placeholder="Price (₹)"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            />
            <input
              type="number"
              className="input-field flex-1"
              placeholder="Qty"
              value={form.qty}
              onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button className="btn-secondary py-2.5" onClick={addItem}>Add to today's drop</button>
        </div>
      </div>

      {items.map(item => (
        <div key={item.id} className="flex items-center gap-3 p-3 card mb-2">
          <div className="flex-1">
            <p className="text-sm font-600 text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-500">₹{item.price} · Qty: {item.qty}</p>
          </div>
          <span className="badge bg-amber-100 text-amber-700">Ad-hoc</span>
          <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500 p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      ))}
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

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal-sheet">
        {/* Header */}
        <div className="sticky top-0 bg-brand-700 px-5 py-4 rounded-t-[20px]">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-white font-800 text-base">
              {step === 'select' ? "Today's Drop" : '📱 Preview Card'}
            </h2>
            <button onClick={close} className="text-white/70 p-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <p className="text-white/60 text-xs">
            {step === 'select'
              ? `${totalSelected} selected · Set prices & qty for today`
              : 'This is what your customers will see'}
          </p>
        </div>

        {step === 'select' && (
          <div className="p-4">
            {/* Catalog products */}
            <p className="text-xs font-600 text-gray-500 uppercase tracking-wider mb-3">
              📱 From your WhatsApp catalog
            </p>
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
            <div className="mt-5 pb-4">
              <button
                className="btn-primary"
                onClick={handlePreview}
                disabled={totalSelected === 0}
              >
                Preview marketing card →
              </button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="p-5">
            {/* Card preview */}
            <MarketingCardPreview items={buildItems()} profile={profile} />

            <div className="flex gap-3 mt-5 pb-4">
              <button className="btn-secondary flex-1" onClick={() => setStep('select')}>
                ← Edit
              </button>
              <button className="btn-primary flex-1" onClick={handlePublish}>
                🚀 Publish & Share
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Marketing card inline preview ───────────────────────────────────────────
function MarketingCardPreview({ items, profile }) {
  return (
    <div className="marketing-card shadow-float" style={{
      background: 'linear-gradient(160deg, #075E54 0%, #128C7E 40%, #1a6b3c 100%)',
    }}>
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-sm">{profile.businessType?.icon}</span>
          </div>
          <div>
            <p className="text-white font-800 text-sm leading-none">{profile.businessName}</p>
            <p className="text-white/60 text-xs">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
        <div className="h-px bg-white/20 mt-3" />
      </div>

      {/* Products */}
      <div className="px-4 flex flex-col gap-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
            {item.image && !item.adHoc && (
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
            )}
            {(item.adHoc || !item.image) && (
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{profile.businessType?.icon}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-700 text-sm truncate">{item.name}</p>
              <p className="text-white/60 text-xs mt-0.5">Available: {item.todayQty}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-800 text-base">₹{item.todayPrice}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-5 mt-3">
        <div className="bg-[#25D366] rounded-2xl p-4 text-center">
          <p className="text-white font-800 text-sm">Order on WhatsApp</p>
          <p className="text-white/80 text-xs mt-0.5">Tap to order · Limited qty</p>
        </div>
      </div>
    </div>
  )
}
