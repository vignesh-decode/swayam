import { useApp, A } from '../../context/AppContext'
import { OnboardingLayout } from './OnboardingFlow'

const PAYMENT_METHODS = [
  {
    id: 'upi',
    name: 'UPI (GPay / PhonePe)',
    icon: '📱',
    description: 'Accept payments via any UPI app',
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: '🏦',
    description: 'Direct bank transfer / NEFT / IMPS',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: '💵',
    description: 'Customers pay when they receive the order',
  },
]

export default function Step5Payment({ onBack }) {
  const { state, setProfileField, dispatch } = useApp()
  const { profile } = state
  const selectedMethods = profile.paymentMethods || []

  function toggleMethod(methodId) {
    const updated = selectedMethods.includes(methodId)
      ? selectedMethods.filter(m => m !== methodId)
      : [...selectedMethods, methodId]
    setProfileField('paymentMethods', updated)
  }

  function finish() {
    if (selectedMethods.length === 0) return
    dispatch({ type: A.COMPLETE_ONBOARDING })
  }

  return (
    <OnboardingLayout
      step={5}
      title="Payment & preferences"
      subtitle="How should customers pay you?"
      onBack={onBack}
      footer={
        <div>
          <button className="btn-primary" onClick={finish} disabled={selectedMethods.length === 0}>
            Launch my store
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">You can change all settings later from your dashboard</p>
        </div>
      }
    >
      <div className="p-5 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-600 text-gray-500 uppercase tracking-wider mb-3">
            Accepted payment methods
          </label>
          <p className="text-xs text-gray-400 mb-3">Select one or more</p>
          <div className="flex flex-col gap-3">
            {PAYMENT_METHODS.map(method => {
              const isSelected = selectedMethods.includes(method.id)
              return (
                <button
                  key={method.id}
                  onClick={() => toggleMethod(method.id)}
                  className={`select-tile text-left gap-3 ${isSelected ? 'selected' : ''}`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1">
                    <p className="font-700 text-sm text-gray-900">{method.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                  </div>
                  <div className={`check-circle flex-shrink-0 ${isSelected ? 'checked' : ''}`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-600 text-sm text-gray-900">Allow "Pay Later"</p>
              <p className="text-xs text-gray-500 mt-0.5">Customers can pay after delivery</p>
            </div>
            <button
              onClick={() => setProfileField('payLaterEnabled', !profile.payLaterEnabled)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${profile.payLaterEnabled ? 'bg-brand-700' : 'bg-gray-200'}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${profile.payLaterEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

      </div>
    </OnboardingLayout>
  )
}
