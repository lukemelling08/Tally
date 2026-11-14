import { useLiveQuery } from 'dexie-react-hooks'
import logo from '../assets/tally-logo.svg'
import logoOnDark from '../assets/tally-logo-on-dark.svg'
import Button from '../components/Button'
import TripCard from '../components/TripCard'
import { ArrowUpIcon } from '../components/icons'
import { db, groupByTrip, sortTrips, totalGross } from '../db'
import { formatGBP } from '../format'
import { scrollToTop } from '../router'

function TripsPage() {
  const trips = useLiveQuery(() => db.trips.toArray())
  const expenses = useLiveQuery(() => db.expenses.toArray())

  const byTrip = groupByTrip(expenses ?? [])
  const expensed = totalGross((expenses ?? []).filter((e) => e.status === 'expensed'))
  const pending = totalGross((expenses ?? []).filter((e) => e.status === 'pending'))
  const loaded = trips !== undefined && expenses !== undefined

  return (
    <main className="content">
      <div className="hero">
        <h1 className="title">
          <img src={logo} alt="Tally" className="title__logo title__logo--light" />
          <img src={logoOnDark} alt="Tally" className="title__logo title__logo--dark" />
        </h1>
        {/* Each stat stays whole, so a narrow screen wraps between them */}
        <p className="summary">
          <span>{trips?.length ?? 0} Trips made&nbsp;·</span>{' '}
          <span>{formatGBP(expensed)} expensed&nbsp;·</span>{' '}
          <span>{formatGBP(pending)} pending&nbsp;·</span>{' '}
          <span>{formatGBP(expensed + pending)} total</span>
        </p>
      </div>

      {loaded && trips.length === 0 && (
        <div className="empty-card">
          <p>No trips yet.</p>
          <p>Tap + to add your first expense.</p>
        </div>
      )}

      {loaded && trips.length > 0 && (
        <>
          <ul className="trip-list">
            {sortTrips(trips).map((trip) => (
              <li key={trip.id}>
                <TripCard trip={trip} expenses={byTrip.get(trip.id) ?? []} />
              </li>
            ))}
          </ul>

          <div className="scroll-top">
            <Button icon={<ArrowUpIcon />} onClick={scrollToTop}>
              Scroll to top
            </Button>
          </div>
        </>
      )}
    </main>
  )
}

export default TripsPage
