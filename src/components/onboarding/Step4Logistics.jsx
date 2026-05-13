import { useApp, A } from '../../context/AppContext'
import { DELIVERY_PARTNERS } from '../../data/deliveryPartners'
import { OnboardingLayout } from './OnboardingFlow'

const DEFAULT_PARTNER = DELIVERY_PARTNERS[0]

function hasSelf(t)    { return t === 'self'    || t === 'both' }
function hasPartner(t) { return t === 'partner' || t === 'both' }

function nextType(current, key) {
  const self    = hasSelf(current)
  const partner = hasPartner(current)
  const nextSelf    = key === 'self'    ? !self    : self
  const nextPartner = key === 'partner' ? !partner : partner
  if (nextSelf && nextPartner) return 'both'
  if (nextSelf)                return 'self'
  if (nextPartner)             return 'partner'
  return null
}

function Check() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Step4Logistics({ onNext, onBack }) {
  const { state, setProfileField } = useApp()
  const { profile } = state

  function toggleType(key) {
    const next = nextType(profile.deliveryType, key)
    setProfileField('deliveryType', next)
    if (key === 'partner') {
      setProfileField('deliveryPartner', hasPartner(next) ? DEFAULT_PARTNER : null)
    }
  }

  const selfChecked    = hasSelf(profile.deliveryType)
  const partnerChecked = hasPartner(profile.deliveryType)
  const canContinue    = !!profile.deliveryType

  return (
    <OnboardingLayout
      step={4}
      title="How will you deliver?"
      subtitle="Set up your delivery workflow"
      onBack={onBack}
      footer={<button className="btn-primary" onClick={onNext} disabled={!canContinue}>Continue →</button>}
    >
      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => toggleType('self')}
            className={`select-tile flex-col items-start gap-2 text-left ${selfChecked ? 'selected' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-2xl">🛵</span>
              <div className="flex-1">
                <p className="font-700 text-gray-900 text-sm">Self-Delivery / Customer Pickup</p>
                <p className="text-xs text-gray-500 mt-0.5">You handle delivery yourself, or customers pick up from you</p>
              </div>
              <div className={`check-circle ${selfChecked ? 'checked' : ''}`}>
                {selfChecked && <Check />}
              </div>
            </div>
          </button>

          <button
            onClick={() => toggleType('partner')}
            className={`select-tile flex-col items-start gap-2 text-left ${partnerChecked ? 'selected' : ''}`}
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-2xl">🏍️</span>
              <div className="flex-1">
                <p className="font-700 text-gray-900 text-sm">Delivery Partner</p>
                <p className="text-xs text-gray-500 mt-0.5">Tie up with a delivery partner — fee auto-calculated per order</p>
              </div>
              <div className={`check-circle ${partnerChecked ? 'checked' : ''}`}>
                {partnerChecked && <Check />}
              </div>
            </div>
          </button>
        </div>
      </div>
    </OnboardingLayout>
  )
}
