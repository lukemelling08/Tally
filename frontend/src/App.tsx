import Button from './components/Button'
import { PlusIcon, UserIcon } from './components/icons'
import NewExpensePage from './pages/NewExpensePage'
import SettingsPage from './pages/SettingsPage'
import TripOverviewPage from './pages/TripOverviewPage'
import TripsPage from './pages/TripsPage'
import { navigate, scrollToTop, usePathname } from './router'

function currentPage(pathname: string) {
  if (pathname === '/settings') return <SettingsPage />
  if (pathname === '/expenses/new') return <NewExpensePage />
  const trip = pathname.match(/^\/trips\/([^/]+)$/)
  if (trip) return <TripOverviewPage tripId={decodeURIComponent(trip[1])} />
  return <TripsPage />
}

function App() {
  const pathname = usePathname()

  // Back to the main menu, or to the top of it if already there
  function goHome() {
    if (pathname === '/') scrollToTop()
    else navigate('/')
  }

  return (
    <>
      <header className="top-banner">
        <div className="top-banner__bar">
          <Button
            variant="inverse"
            icon={<img src="/tally-mark.svg" alt="" className="top-banner__mark" />}
            aria-label="Tally home"
            onClick={goHome}
          />
          <div className="top-banner__actions">
            <Button
              variant="ghost-inverse"
              icon={<UserIcon />}
              aria-label="Account"
              aria-current={pathname === '/settings' ? 'page' : undefined}
              onClick={() => navigate('/settings')}
            />
            <Button
              variant="inverse"
              icon={<PlusIcon />}
              aria-label="Add expense"
              aria-current={pathname === '/expenses/new' ? 'page' : undefined}
              onClick={() => navigate('/expenses/new')}
            />
          </div>
        </div>
      </header>

      {/* Keyed so each page starts fresh, e.g. a new blank expense form */}
      <div key={pathname}>{currentPage(pathname)}</div>
    </>
  )
}

export default App
