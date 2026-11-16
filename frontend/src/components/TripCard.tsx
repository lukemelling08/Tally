import { setTripStatus, totalGross, tripStatus, type Expense, type Trip } from '../db'
import { formatDateRange, formatDayMonth, formatGBP } from '../format'
import { placeCode } from '../places'
import Button from './Button'
import Link from './Link'
import { CheckIcon, ClockIcon } from './icons'
import './TripCard.css'

const PREVIEW_COUNT = 4

function TripCard({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const preview = expenses.slice(0, PREVIEW_COUNT)
  const status = tripStatus(expenses)
  const nextStatus = status === 'pending' ? 'expensed' : 'pending'

  return (
    <article className="trip-card">
      {/* The card opens the trip; the status band is its own button */}
      <Link to={`/trips/${trip.id}`} className="trip-card__body">
        <div className="trip-card__header">
          <h2 className="trip-card__route">
            <span aria-hidden="true">{placeCode(trip.destination)}</span>
            <span className="visually-hidden">{trip.destination}</span>
            <span className="trip-card__dates">
              {' · '}
              {formatDateRange(trip.start, trip.end)}
            </span>
          </h2>
          <p className="trip-card__balance">
            <span className="visually-hidden">Balance </span>
            {formatGBP(totalGross(expenses))}
          </p>
        </div>

        <ul className="trip-card__transactions">
          {preview.map((e) => (
            <li key={e.id} className="transaction">
              <span className="transaction__company">{e.company}</span>
              <span className="transaction__amount">{formatGBP(e.gross)}</span>
              <time className="transaction__time" dateTime={e.purchasedAt}>
                {formatDayMonth(e.purchasedAt)}
              </time>
            </li>
          ))}
        </ul>
      </Link>

      <Button
        icon={status === 'pending' ? <ClockIcon /> : <CheckIcon />}
        className={`trip-card__status trip-card__status--${status}`}
        aria-label={`${status === 'pending' ? 'Pending' : 'Expensed'}. Mark as ${nextStatus}`}
        onClick={() => setTripStatus(trip.id, nextStatus)}
      >
        {status === 'pending' ? 'Pending' : 'Expensed'}
      </Button>
    </article>
  )
}

export default TripCard
