import { totalGross, tripStatus, type Expense, type Trip } from '../db'
import { formatDateRange, formatGBP } from '../format'
import { CheckIcon, ClockIcon } from './icons'
import './TripCard.css'
import './TripDetails.css'

// Header card for the trip viewer: full destination, dates, total and status
function TripSummary({ trip, expenses }: { trip: Trip; expenses: Expense[] }) {
  const status = tripStatus(expenses)

  return (
    <header className="trip-overview">
      <div className="trip-overview__body">
        <h1 className="trip-overview__title">{trip.destination}</h1>
        <div className="trip-overview__meta">
          <span>
            {formatDateRange(trip.start, trip.end)} · {expenses.length}{' '}
            {expenses.length === 1 ? 'purchase' : 'purchases'}
          </span>
          <span className="trip-overview__total">
            <span className="visually-hidden">Total </span>
            {formatGBP(totalGross(expenses))}
          </span>
        </div>
      </div>
      <div className={`trip-card__status trip-card__status--${status}`}>
        {status === 'pending' ? <ClockIcon /> : <CheckIcon />}
        {status === 'pending' ? 'Pending' : 'Expensed'}
      </div>
    </header>
  )
}

export default TripSummary
