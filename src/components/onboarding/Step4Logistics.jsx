import { useState } from 'react'
import { useApp, A } from '../../context/AppContext'
import { DELIVERY_PARTNERS } from '../../data/deliveryPartners'
import { OnboardingLayout } from './OnboardingFlow'

export default function Step4Logistics({ onNext, onBack }) {
  const { state, setProfileField } = useApp()
  const { profile } = state
  const [showPartners, setShowPartners] = useState(false)

  function selectSelf() {
    setProfileField('deliveryType', 'self')
    setProfileField('deliveryPartner', null)
    setShowPartners(false)
  }

  function selectPartner() {
    setProfileField('deliveryType', 'partner')
    setShowPartners(true)
  }

  function selectDeliveryPartner(partner) {
    setProfileField('deliveryPartner', partner)
  }

  function canContinue() {
    if (!profile.deliveryType) return false
    if (profile.deliveryType === 'partner' && !profile.deliveryPartner) return false
    return true
  }

  return (
    <OnboardingLayout
      step={4}
      title="How will you deliver?"
      subtitle="Set up your delivery workflow"
      onBack={onBack}
      footer={<button className="btn-primary" onClick={onNext} disabled={!canContinue()}>Continue →</button>}
    >
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <button
            onClick={selectSelf}
            className={`select-tile flex-col items-start gap-2 text-left ${profile.deliveryType === 'self' ? 'selected' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-2xl">🛵</span>
              <div className="flex-1">
                <p className="font-700 text-gray-900 text-sm">Self-Delivery / Customer Pickup</p>
                <p className="text-xs text-gray-500 mt-0.5">You handle delivery yourself, or customers pick up from you</p>
              </div>
              <div className={`check-circle ${profile.deliveryType === 'self' ? 'checked' : ''}`}>
                {profile.deliveryType === 'self' && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </button>

          <button
            onClick={selectPartner}
            className={`select-tile flex-col items-start gap-2 text-left ${profile.deliveryType === 'partner' ? 'selected' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-2xl">🏍️</span>
              <div className="flex-1">
                <p className="font-700 text-gray-900 text-sm">Delivery Partner Integration</p>
                <p className="text-xs text-gray-500 mt-0.5">Tie up with a delivery partner — fee auto-calculated per order</p>
              </div>
              <div className={`check-circle ${profile.deliveryType === 'partner' ? 'checked' : ''}`}>
                {profile.deliveryType === 'partner' && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </button>
        </div>

        {showPartners && (
          <div className="animate-fade-in">
            <p className="text-xs font-600 text-gray-500 uppercase tracking-wider mb-3">
              Choose your delivery partner
            </p>
            <div className="flex flex-col gap-2">
              {DELIVERY_PARTNERS.map(partner => (
                <button
                  key={partner.id}
                  onClick={() => selectDeliveryPartner(partner)}
                  className={`select-tile text-left gap-3 ${profile.deliveryPartner?.id === partner.id ? 'selected' : ''}`}
                >
                  <span className="text-2xl">{partner.logo}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-700 text-sm text-gray-900">{partner.name}</p>
                      <span className="badge bg-gray-100 text-gray-500 text-xs">{partner.category}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{partner.tagline}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-brand-700 font-500">📍 {partner.range}</span>
                      <span className="text-xs text-gray-400">⏱ {partner.estimatedTime}</span>
                      <span className="text-xs text-amber-600 font-500">₹{partner.baseFee}+ base</span>
                    </div>
                  </div>
                  <div className={`check-circle flex-shrink-0 ${profile.deliveryPartner?.id === partner.id ? 'checked' : ''}`}>
                    {profile.deliveryPartner?.id === partner.id && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </OnboardingLayout>
  )
}
