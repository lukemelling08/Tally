import { totalGross, tripStatus, type Expense, type Trip } from '../db'
import { formatDateRange, formatDayMonth, formatGBP } from '../format'
import { tripRoute } from '../places'
import Link from './Link'
import { CheckIcon, ClockIcon } from './icons'
import './TripCard.css'

const PREVIEW_COUNT = 4

function TripCard({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const preview = expenses.slice(0, PREVIEW_COUNT)
  const status = tripStatus(expenses)

  return (
    <Link to={`/trips/${trip.id}`} className="trip-card">
      <div className="trip-card__body">
        <div className="trip-card__header">
          <h2 className="trip-card__route">
            <span aria-hidden="true">{tripRoute(trip.from, trip.to)}</span>
            <span className="visually-hidden">
              {trip.from} to {trip.to}
            </span>
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
      </div>

      <div className={`trip-card__status trip-card__status--${status}`}>
        {status === 'pending' ? <ClockIcon /> : <CheckIcon />}
        {status === 'pending' ? 'Pending' : 'Expensed'}
      </div>
    </Link>
  )
}

export default TripCard
