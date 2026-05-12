import { useApp } from '../../context/AppContext'
import { OnboardingLayout } from './OnboardingFlow'

const OPTIONS = [
  {
    value: true,
    icon: '🌅',
    title: 'Yes, I prepare fresh every day',
    subtitle: 'You\'ll get a "Preparing" bucket to track production',
    examples: 'Great for bakers, tiffin services, fresh produce',
  },
  {
    value: false,
    icon: '📦',
    title: 'No, I keep items in stock',
    subtitle: 'You\'ll get an "In-Stock" bucket for bulk inventory',
    examples: 'Great for crafts, pickles, clothing, plants',
  },
]

export default function Step2Perishable({ onNext, onBack }) {
  const { state, setProfileField } = useApp()
  const { profile } = state

  function handleSelect(value) {
    setProfileField('isPerishable', value)
  }

  function handleNext() {
    if (profile.isPerishable === null) return
    onNext()
  }

  return (
    <OnboardingLayout
      step={2}
      title="How do you make your products?"
      subtitle="This shapes your daily workflow"
      onBack={onBack}
      footer={<button className="btn-primary" onClick={handleNext} disabled={profile.isPerishable === null}>Continue →</button>}
    >
      <div className="p-5 flex flex-col gap-4">
        {OPTIONS.map(opt => (
          <button
            key={String(opt.value)}
            onClick={() => handleSelect(opt.value)}
            className={`select-tile flex-col items-start relative text-left ${
              profile.isPerishable === opt.value ? 'selected' : ''
            }`}
          >
            <div className="flex items-start gap-3 w-full">
              <span className="text-3xl">{opt.icon}</span>
              <div className="flex-1">
                <p className="font-700 text-gray-900 text-sm leading-snug">{opt.title}</p>
                <p className="text-xs text-gray-500 mt-1">{opt.subtitle}</p>
                <p className="text-xs text-brand-600 mt-2 font-500">{opt.examples}</p>
              </div>
              <div className={`check-circle flex-shrink-0 mt-0.5 ${profile.isPerishable === opt.value ? 'checked' : ''}`}>
                {profile.isPerishable === opt.value && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Contextual tip */}
        {profile.isPerishable !== null && (
          <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 animate-fade-in">
            <p className="text-xs font-600 text-brand-700 mb-1">
              {profile.isPerishable ? '🌅 Daily Fresh mode enabled' : '📦 Inventory mode enabled'}
            </p>
            <p className="text-xs text-brand-600">
              {profile.isPerishable
                ? 'Each morning, you\'ll tell us what you\'re making and in what quantity. Orders will track "preparing → ready → delivered."'
                : 'You\'ll manage stock levels. Orders flow from "in-stock → packed → delivered" without a preparation step.'}
            </p>
          </div>
        )}

      </div>
    </OnboardingLayout>
  )
}
