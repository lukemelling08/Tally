import logo from './assets/tally-logo.svg'
import Button from './components/Button'
import TripCard from './components/TripCard'
import { ArrowUpIcon, PlusIcon, UserIcon } from './components/icons'
import { TRIPS, totalGross } from './data/trips'
import { formatGBP } from './format'

const transactions = TRIPS.flatMap((trip) => trip.transactions)
const expensed = totalGross(transactions.filter((t) => t.status === 'expensed'))
const pending = totalGross(transactions.filter((t) => t.status === 'pending'))

function scrollToTop() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
}

// Back to the main menu, or to the top of it if already there
function goHome() {
  if (window.location.pathname !== '/') {
    window.location.assign('/')
  } else {
    scrollToTop()
  }
}

function App() {
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
            <Button variant="ghost-inverse" icon={<UserIcon />} aria-label="Account" />
            <Button variant="inverse" icon={<PlusIcon />} aria-label="Add expense" />
          </div>
        </div>
      </header>

      <main className="content">
        <div className="hero">
          <h1 className="title">
            <img src={logo} alt="Tally" className="title__logo" />
          </h1>
          {/* Each stat stays whole, so a narrow screen wraps between them */}
          <p className="summary">
            <span>{TRIPS.length} Trips made&nbsp;·</span>{' '}
            <span>{formatGBP(expensed)} expensed&nbsp;·</span>{' '}
            <span>{formatGBP(pending)} pending&nbsp;·</span>{' '}
            <span>{formatGBP(expensed + pending)} total</span>
          </p>
        </div>

        <ul className="trip-list">
          {TRIPS.map((trip) => (
            <li key={trip.id}>
              <TripCard trip={trip} />
            </li>
          ))}
        </ul>

        <div className="scroll-top">
          <Button icon={<ArrowUpIcon />} onClick={scrollToTop}>
            Scroll to top
          </Button>
        </div>
      </main>
    </>
  )
}

export default App
