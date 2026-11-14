import Button from './components/Button'
import { PlusIcon, UserIcon } from './components/icons'
import SettingsPage from './pages/SettingsPage'
import TripsPage from './pages/TripsPage'
import { navigate, scrollToTop, usePathname } from './router'

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
            <Button variant="inverse" icon={<PlusIcon />} aria-label="Add expense" />
          </div>
        </div>
      </header>

      {pathname === '/settings' ? <SettingsPage /> : <TripsPage />}
    </>
  )
}

export default App
