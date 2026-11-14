import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import Link from '../components/Link'
import ReceiptDialog from '../components/ReceiptDialog'
import { CheckIcon, ClockIcon, ReceiptIcon, ShareIcon, TrashIcon } from '../components/icons'
import { db, deleteExpense, totalGross, tripStatus, type Expense } from '../db'
import { buildTripExport, shareFile } from '../export'
import { formatDateRange, formatDayMonth, formatGBP } from '../format'
import { navigate } from '../router'
import '../components/TripCard.css'
import './TripOverviewPage.css'

function TripOverviewPage({ tripId }: { tripId: string }) {
  // null once loaded means the trip doesn't exist
  const trip = useLiveQuery(() => db.trips.get(tripId).then((t) => t ?? null), [tripId])
  const expenses = useLiveQuery(
    () => db.expenses.where('tripId').equals(tripId).sortBy('purchasedAt'),
    [tripId],
  )
  const [viewing, setViewing] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState<Expense | null>(null)
  const [exportFile, setExportFile] = useState<File>()

  // Build the zip ahead of time: iOS only opens the share sheet if share() is
  // called straight from the tap, with no slow work in between
  useEffect(() => {
    if (!trip || !expenses?.length) return
    let cancelled = false
    buildTripExport(trip, expenses).then((file) => {
      if (!cancelled) setExportFile(file)
    })
    return () => {
      cancelled = true
    }
  }, [trip, expenses])

  if (trip === undefined || expenses === undefined) return <main className="content narrow" />

  if (trip === null) {
    return (
      <main className="content narrow">
        <h1 className="page-title">Trip not found</h1>
        <p>
          <Link to="/">Back to all trips</Link>
        </p>
      </main>
    )
  }

  const status = tripStatus(expenses)
  const deletingLast = expenses.length === 1

  async function confirmDelete() {
    if (!deleting) return
    const tripRemoved = await deleteExpense(deleting)
    setDeleting(null)
    if (tripRemoved) navigate('/')
  }

  return (
    <main className="content narrow">
      <header className="trip-overview">
        <div className="trip-overview__body">
          <h1 className="trip-overview__title">
            {trip.from} → {trip.to}
          </h1>
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

      <ul className="expense-list">
        {expenses.map((expense) => (
          <li key={expense.id} className="expense-card">
            <div className="expense-card__row">
              <span className="expense-card__company">{expense.company}</span>
              <span className="expense-card__amount">{formatGBP(expense.gross)}</span>
            </div>
            {expense.details && <p className="expense-card__details">{expense.details}</p>}
            <div className="expense-card__row">
              <time className="expense-card__time" dateTime={expense.purchasedAt}>
                {formatDayMonth(expense.purchasedAt)}
              </time>
              {expense.hasReceipt ? (
                <Button
                  variant="ghost"
                  size="small"
                  icon={<ReceiptIcon />}
                  aria-label={`Receipt for ${expense.company}`}
                  onClick={() => setViewing(expense)}
                >
                  Receipt
                </Button>
              ) : (
                <span className="expense-card__no-receipt">No receipt</span>
              )}
            </div>
            <Button
              variant="danger"
              size="small"
              icon={<TrashIcon />}
              aria-label={`Delete expense: ${expense.company}`}
              onClick={() => setDeleting(expense)}
            >
              Delete expense
            </Button>
          </li>
        ))}
      </ul>

      <div className="trip-overview__share">
        <Button
          icon={<ShareIcon />}
          disabled={!exportFile}
          onClick={() => exportFile && shareFile(exportFile)}
        >
          {exportFile ? 'Share' : 'Preparing…'}
        </Button>
        <p className="field__hint">A zip with a spreadsheet of these expenses and every receipt.</p>
      </div>

      <ReceiptDialog
        expenseId={viewing?.id ?? null}
        title={viewing?.company ?? ''}
        onClose={() => setViewing(null)}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete expense?"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      >
        {deleting && (
          <>
            <p>
              {deleting.company}, {formatGBP(deleting.gross)} on {formatDayMonth(deleting.purchasedAt)}
              {deleting.hasReceipt && ', and its receipt'} will be removed. This can't be undone.
            </p>
            {deletingLast && <p>It's the only expense on this trip, so the trip will be deleted too.</p>}
          </>
        )}
      </ConfirmDialog>
    </main>
  )
}

export default TripOverviewPage
