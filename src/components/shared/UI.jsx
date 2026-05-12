// ─── Shared UI primitives ────────────────────────────────────────────────────

export function Button({ children, variant = 'primary', onClick, disabled, className = '', type = 'button' }) {
  const base = variant === 'primary' ? 'btn-primary' : variant === 'secondary' ? 'btn-secondary' : 'btn-ghost'
  return (
    <button type={type} className={`${base} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-700 text-gray-900">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Badge({ children, color = 'gray' }) {
  const colors = {
    green:  'bg-green-100 text-green-800',
    amber:  'bg-amber-100 text-amber-700',
    blue:   'bg-blue-100 text-blue-800',
    red:    'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-800',
    gray:   'bg-gray-100 text-gray-600',
    brand:  'bg-brand-100 text-brand-700',
  }
  return (
    <span className={`badge ${colors[color] ?? colors.gray}`}>{children}</span>
  )
}

export function StatusBadge({ status }) {
  const map = {
    new:         { label: 'New',         cls: 'status-new' },
    preparing:   { label: 'Preparing',   cls: 'status-preparing' },
    instock:     { label: 'Ready',       cls: 'status-instock' },
    fulfillment: { label: 'Packed',      cls: 'status-fulfillment' },
    delivered:   { label: 'Delivered',   cls: 'status-delivered' },
    cancelled:   { label: 'Cancelled',   cls: 'status-cancelled' },
  }
  const { label, cls } = map[status] ?? map.new
  return <span className={`badge ${cls}`}>{label}</span>
}

export function Divider({ className = '' }) {
  return <div className={`h-px bg-gray-100 ${className}`} />
}

export function Avatar({ name, size = 38, bg = '#075E54' }) {
  const initials = name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
  return (
    <div
      style={{ width: size, height: size, background: bg, fontSize: size * 0.35, flexShrink: 0 }}
      className="rounded-full flex items-center justify-center text-white font-700"
    >
      {initials}
    </div>
  )
}

export function Spinner({ size = 20, color = '#075E54' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="3"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}

export function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="font-600 text-gray-800 text-base mb-1">{title}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}

export function SectionHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-700 text-gray-900 text-base">{title}</h3>
      {action && (
        <button onClick={onAction} className="text-sm font-600 text-brand-700">
          {action}
        </button>
      )}
    </div>
  )
}
