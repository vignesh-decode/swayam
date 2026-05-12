import { useApp, A } from '../../context/AppContext'
import Step1Identity from './Step1Identity'
import Step2Perishable from './Step2Perishable'
import Step3WhatsAppSync from './Step3WhatsAppSync'
import Step4Logistics from './Step4Logistics'
import Step5Payment from './Step5Payment'

// ─── Step dot indicator ───────────────────────────────────────────────────────
function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`step-dot ${i + 1 === current ? 'active' : i + 1 < current ? 'done' : ''}`}
        />
      ))}
    </div>
  )
}

// ─── Onboarding layout wrapper ────────────────────────────────────────────────
export function OnboardingLayout({ step, title, subtitle, children, onBack, footer }) {
  return (
    <div className="app-shell animate-fade-in">
      {/* Header */}
      <div className="onboarding-header">
        <div className="flex items-center justify-between mb-4">
          {onBack ? (
            <button onClick={onBack} className="text-white/70 hover:text-white p-1 -ml-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          ) : (
            <img src="/logo.svg" alt="SWAYAM" style={{ height: 26, width: 'auto' }} />
          )}
          <StepDots current={step} total={5} />
        </div>
        <h1 className="text-white font-800 text-2xl leading-snug">{title}</h1>
        {subtitle && <p className="text-white/70 text-sm mt-1">{subtitle}</p>}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Fixed footer button */}
      {footer && (
        <div className="onboarding-footer">
          {footer}
        </div>
      )}
    </div>
  )
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
export default function OnboardingFlow() {
  const { state, dispatch } = useApp()
  const { onboardingStep } = state

  const next = () => dispatch({ type: A.NEXT_STEP })
  const prev = () => dispatch({ type: A.PREV_STEP })

  return (
    <>
      {onboardingStep === 1 && <Step1Identity onNext={next} />}
      {onboardingStep === 2 && <Step2Perishable onNext={next} onBack={prev} />}
      {onboardingStep === 3 && <Step3WhatsAppSync onNext={next} onBack={prev} />}
      {onboardingStep === 4 && <Step4Logistics onNext={next} onBack={prev} />}
      {onboardingStep === 5 && <Step5Payment onBack={prev} />}
    </>
  )
}
