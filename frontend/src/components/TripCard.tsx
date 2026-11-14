import { totalGross, tripStatus, type Trip } from '../data/trips'
import { formatDateRange, formatDateTime, formatGBP } from '../format'
import { CheckIcon, ClockIcon } from './icons'
import './TripCard.css'

const PREVIEW_COUNT = 4

function TripCard({ trip }: { trip: Trip }) {
  const preview = trip.transactions.slice(0, PREVIEW_COUNT)
  const status = tripStatus(trip)
  const headingId = `trip-${trip.id}`

  return (
    <article className="trip-card" aria-labelledby={headingId}>
      <div className="trip-card__body">
        <header className="trip-card__header">
          <h2 id={headingId} className="trip-card__route">
            {trip.from} → {trip.to}
            <span className="trip-card__dates">
              {' · '}
              {formatDateRange(trip.start, trip.end)}
            </span>
          </h2>
          <p className="trip-card__balance">
            <span className="visually-hidden">Balance </span>
            {formatGBP(totalGross(trip.transactions))}
          </p>
        </header>

        <ul className="trip-card__transactions">
          {preview.map((t) => (
            <li key={t.id} className="transaction">
              <span className="transaction__company">{t.company}</span>
              <span className="transaction__amount">{formatGBP(t.gross)}</span>
              <time className="transaction__time" dateTime={t.purchasedAt}>
                {formatDateTime(t.purchasedAt)}
              </time>
            </li>
          ))}
        </ul>
      </div>

      <footer className={`trip-card__status trip-card__status--${status}`}>
        {status === 'pending' ? <ClockIcon /> : <CheckIcon />}
        {status === 'pending' ? 'Pending' : 'Expensed'}
      </footer>
    </article>
  )
}

export default TripCard
