import { useApp, A } from './context/AppContext'
import IntroScreen from './components/intro/IntroScreen'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import Dashboard from './components/dashboard/Dashboard'
import Storefront from './components/storefront/Storefront'
import DailyDropModal from './components/dailydrop/DailyDropModal'
import MarketingCard from './components/dailydrop/MarketingCard'

// ─── View switch button (dev helper shown in dashboard corner) ────────────────
function ViewToggle() {
  const { state, dispatch } = useApp()
  const { view, todaysDrop } = state

  if (!todaysDrop.isActive) return null

  return (
    <div className="fixed top-4 right-4 z-[150] flex flex-col gap-2">
      <button
        onClick={() => dispatch({ type: A.SET_VIEW, payload: view === 'dashboard' ? 'storefront' : 'dashboard' })}
        className="bg-white/90 backdrop-blur-sm text-brand-700 text-xs font-700 px-3 py-2 rounded-xl shadow-card border border-gray-200"
      >
        {view === 'dashboard' ? '👤 Customer view →' : '← Dashboard'}
      </button>
    </div>
  )
}

export default function App() {
  const { state, dispatch } = useApp()
  const { view, showDailyDropModal, showMarketingCard } = state

  return (
    <>
      {/* Main view */}
      {view === 'intro'       && <IntroScreen />}
      {view === 'onboarding'  && <OnboardingFlow />}
      {view === 'dashboard'   && <Dashboard />}
      {view === 'storefront'  && <Storefront />}

      {/* Overlays */}
      {showDailyDropModal && <DailyDropModal />}
      {showMarketingCard  && <MarketingCard onClose={() => dispatch({ type: A.CLOSE_MARKETING_CARD })} />}

      {/* Dev toggle */}
      <ViewToggle />
    </>
  )
}
