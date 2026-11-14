import logo from '../assets/tally-logo.svg'
import logoOnDark from '../assets/tally-logo-on-dark.svg'
import Button from '../components/Button'
import TripCard from '../components/TripCard'
import { ArrowUpIcon } from '../components/icons'
import { TRIPS, totalGross } from '../data/trips'
import { formatGBP } from '../format'
import { scrollToTop } from '../router'

const transactions = TRIPS.flatMap((trip) => trip.transactions)
const expensed = totalGross(transactions.filter((t) => t.status === 'expensed'))
const pending = totalGross(transactions.filter((t) => t.status === 'pending'))

function TripsPage() {
  return (
    <main className="content">
      <div className="hero">
        <h1 className="title">
          <img src={logo} alt="Tally" className="title__logo title__logo--light" />
          <img src={logoOnDark} alt="Tally" className="title__logo title__logo--dark" />
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
  )
}

export default TripsPage
