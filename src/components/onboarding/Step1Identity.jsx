import { useState } from 'react'
import { useApp, A } from '../../context/AppContext'
import { BUSINESS_TYPES } from '../../data/businessCatalogs'
import { OnboardingLayout } from './OnboardingFlow'

export default function Step1Identity({ onNext }) {
  const { state, setProfileField } = useApp()
  const { profile } = state
  const [touched, setTouched] = useState(false)
  const [customType, setCustomType] = useState(profile.customBusinessType || '')

  const isOthersSelected = profile.businessType?.id === 'others'
  const valid = profile.name.trim().length > 1 && profile.businessType !== null && (!isOthersSelected || customType.trim().length > 1)

  function handleSelectType(bt) {
    setProfileField('businessType', bt)
    if (bt.id !== 'others') {
      setCustomType('')
      setProfileField('customBusinessType', '')
    }
  }

  function handleNext() {
    setTouched(true)
    if (!valid) return
    if (isOthersSelected) {
      setProfileField('customBusinessType', customType.trim())
    }
    if (!profile.businessName.trim()) {
      const typeName = isOthersSelected ? customType.trim() : profile.businessType.name
      setProfileField('businessName', `${profile.name.split(' ')[0]}'s ${typeName}`)
    }
    onNext()
  }

  return (
    <OnboardingLayout step={1} title="Let's set up your business" subtitle="Introduce yourself — takes 30 seconds" footer={<button className="btn-primary" onClick={handleNext}>Continue →</button>}>
      <div className="p-5 flex flex-col gap-4">
        {/* Your name */}
        <div>
          <label className="block text-xs font-600 text-gray-500 uppercase tracking-wider mb-2">
            Your name
          </label>
          <input
            className="input-field"
            placeholder="e.g. Priya Sharma"
            value={profile.name}
            onChange={e => setProfileField('name', e.target.value)}
          />
          {touched && !profile.name.trim() && (
            <p className="text-xs text-red-500 mt-1">Please enter your name</p>
          )}
        </div>

        {/* Business name */}
        <div>
          <label className="block text-xs font-600 text-gray-500 uppercase tracking-wider mb-2">
            Business name <span className="normal-case font-400 text-gray-400">(optional)</span>
          </label>
          <input
            className="input-field"
            placeholder={profile.name ? `${profile.name.split(' ')[0]}'s Kitchen` : 'e.g. Priya\'s Kitchen'}
            value={profile.businessName}
            onChange={e => setProfileField('businessName', e.target.value)}
          />
        </div>

        {/* Business type */}
        <div>
          <label className="block text-xs font-600 text-gray-500 uppercase tracking-wider mb-3">
            What do you sell?
          </label>
          {touched && !profile.businessType && (
            <p className="text-xs text-red-500 mb-2">Please select a business type</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {BUSINESS_TYPES.map(bt => (
              <button
                key={bt.id}
                onClick={() => handleSelectType(bt)}
                className={`select-tile flex-col items-start gap-2 ${profile.businessType?.id === bt.id ? 'selected' : ''}`}
              >
                <span className="text-2xl">{bt.icon}</span>
                <div className="text-left">
                  <p className="text-sm font-600 text-gray-800 leading-tight">{bt.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{bt.tagline}</p>
                </div>
                {profile.businessType?.id === bt.id && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-700 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {isOthersSelected && (
            <div className="animate-fade-in mt-2">
              <input
                className="input-field"
                placeholder="e.g. Organic Skincare, Pet Accessories..."
                value={customType}
                onChange={e => setCustomType(e.target.value)}
              />
              {touched && isOthersSelected && !customType.trim() && (
                <p className="text-xs text-red-500 mt-1">Please describe what you sell</p>
              )}
            </div>
          )}
        </div>
      </div>
    </OnboardingLayout>
  )
}
