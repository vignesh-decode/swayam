import { useState, useEffect } from 'react'
import { useApp, A } from '../../context/AppContext'
import { MOCK_CATALOGS } from '../../data/businessCatalogs'
import { OnboardingLayout } from './OnboardingFlow'

const SYNC_STEPS = [
  'Connecting to WhatsApp Business API…',
  'Reading your product catalog…',
  'Importing names, images & descriptions…',
  'Sync complete! ✓',
]

export default function Step3WhatsAppSync({ onNext, onBack }) {
  const { state, dispatch } = useApp()
  const { profile, catalogSynced, catalog } = state

  const [syncing, setSyncing] = useState(false)
  const [syncStep, setSyncStep] = useState(0)
  const [done, setDone] = useState(catalogSynced)

  function startSync() {
    if (!profile.businessType) return
    setSyncing(true)
    setSyncStep(0)

    // Simulate step-by-step sync
    SYNC_STEPS.forEach((_, i) => {
      setTimeout(() => {
        setSyncStep(i)
        if (i === SYNC_STEPS.length - 1) {
          const products = MOCK_CATALOGS[profile.businessType.id] || []
          dispatch({ type: A.SET_CATALOG, payload: products })
          setSyncing(false)
          setDone(true)
        }
      }, i * 900)
    })
  }

  return (
    <OnboardingLayout
      step={3}
      title="Connect WhatsApp Business"
      subtitle="We'll pull your product catalog automatically"
      onBack={onBack}
      footer={done && catalog.length > 0 ? <button className="btn-primary" onClick={onNext}>Continue →</button> : null}
    >
      <div className="p-5 flex flex-col gap-5">
        {/* WA connect card */}
        {!done && !syncing && (
          <div className="card p-5 animate-fade-in">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center shadow-float">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="font-700 text-gray-900">WhatsApp Business</p>
                <p className="text-sm text-gray-500">Catalog sync — {profile.businessType?.name}</p>
              </div>
            </div>

            <div className="bg-surface rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-500 mb-3 font-500">What gets synced:</p>
              {['Product names & descriptions', 'Product images', 'Base prices', 'Product categories'].map(item => (
                <div key={item} className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                      <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>

            <button
              className="btn-primary flex items-center justify-center gap-2"
              onClick={startSync}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Connect & Sync Catalog
            </button>
          </div>
        )}

        {/* Syncing animation */}
        {syncing && (
          <div className="card p-6 flex flex-col items-center gap-5 animate-fade-in">
            <div className="flex gap-2">
              <div className="wa-sync-dot" />
              <div className="wa-sync-dot" />
              <div className="wa-sync-dot" />
            </div>
            <div className="w-full">
              {SYNC_STEPS.map((step, i) => (
                <div key={step} className={`flex items-center gap-3 py-2 transition-opacity duration-300 ${i <= syncStep ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    i < syncStep ? 'bg-[#25D366]' : i === syncStep ? 'bg-brand-700' : 'bg-gray-200'
                  }`}>
                    {i < syncStep
                      ? <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      : i === syncStep
                        ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        : null
                    }
                  </div>
                  <p className={`text-sm ${i <= syncStep ? 'text-gray-800 font-500' : 'text-gray-400'}`}>{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Done — show catalog preview */}
        {done && catalog.length > 0 && (
          <div className="animate-fade-in flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="font-700 text-gray-900">{catalog.length} products synced from WhatsApp</p>
            </div>

            <div className="card overflow-hidden">
              {catalog.slice(0, 4).map((product, i) => (
                <div key={product.id} className={`flex items-center gap-3 p-3 ${i < 3 ? 'border-b border-gray-50' : ''}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                    onError={e => { e.target.style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-400 truncate">{product.description}</p>
                  </div>
                  <p className="text-sm font-700 text-brand-700 flex-shrink-0">₹{product.price}</p>
                </div>
              ))}
              {catalog.length > 4 && (
                <div className="px-3 py-2 bg-gray-50">
                  <p className="text-xs text-gray-400 text-center">+{catalog.length - 4} more products</p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </OnboardingLayout>
  )
}
