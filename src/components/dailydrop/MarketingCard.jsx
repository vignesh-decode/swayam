import { useApp, A } from '../../context/AppContext'

export default function MarketingCard({ onClose }) {
  const { state, dispatch } = useApp()
  const { todaysDrop, profile } = state

  const link = `https://${todaysDrop.smartLink}`

  function copyLink() {
    navigator.clipboard?.writeText(link)
  }

  function shareWhatsApp() {
    const text = `🛍️ *${profile.businessName}* — Today's Drop!\n\n${todaysDrop.items.map(i => `• ${i.name} — ₹${i.todayPrice}`).join('\n')}\n\n🔗 Order here: ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex flex-col items-center justify-center p-5 animate-fade-in">
      <div className="w-full max-w-[340px] bg-white rounded-3xl p-5 shadow-float overflow-y-auto" style={{ maxHeight: '90dvh' }}>
        {/* Published label */}
        <div className="flex items-center gap-2 mb-4 justify-center">
          <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          <p className="text-gray-900 font-700 text-base">Published & Live!</p>
        </div>

        {/* Card */}
        <div className="marketing-card shadow-float w-full rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(160deg, #243928 0%, #2C4A35 40%, #3D5E30 100%)',
        }}>
          {/* Header */}
          <div className="p-5 pb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl">{profile.businessType?.icon}</span>
              </div>
              <div>
                <p className="text-white font-800 leading-none">{profile.businessName}</p>
                <p className="text-white/60 text-sm">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
            <div className="h-px bg-white/20" />
          </div>

          {/* Products */}
          <div className="px-4 flex flex-col gap-3">
            {todaysDrop.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-white/10 rounded-2xl p-3">
                {item.image && !item.adHoc ? (
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{profile.businessType?.icon}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-700 text-sm truncate">{item.name}</p>
                  <p className="text-white/50 text-xs">
                    {item.remaining}/{item.todayQty} left
                  </p>
                </div>
                <p className="text-white font-800 text-base flex-shrink-0">₹{item.todayPrice}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="p-5 mt-3">
            <div className="bg-[#25D366] rounded-2xl p-4 text-center">
              <p className="text-white font-800">Order Now</p>
              <p className="text-white/80 text-xs mt-0.5 font-mono truncate">{todaysDrop.smartLink}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-col gap-3">
          <button
            onClick={shareWhatsApp}
            className="w-full bg-[#25D366] text-white font-700 py-4 rounded-2xl flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share on WhatsApp
          </button>

          <div className="flex gap-3">
            <button
              onClick={copyLink}
              className="flex-1 bg-gray-100 text-gray-700 font-600 py-3.5 rounded-2xl text-sm"
            >
              Copy link
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-600 py-3.5 rounded-2xl text-sm"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
