import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import Button from '../components/Button'
import ConfirmDialog from '../components/ConfirmDialog'
import ExpenseCard from '../components/ExpenseCard'
import Link from '../components/Link'
import ReceiptDialog from '../components/ReceiptDialog'
import ShareDialog from '../components/ShareDialog'
import TripSummary from '../components/TripSummary'
import { ShareIcon } from '../components/icons'
import { db, deleteExpense, loadReceipts, type Expense } from '../db'
import { buildTripExport } from '../export'
import { formatDayMonth, formatGBP } from '../format'
import { navigate } from '../router'

function TripOverviewPage({ tripId }: { tripId: string }) {
  // null once loaded means the trip doesn't exist
  const trip = useLiveQuery(() => db.trips.get(tripId).then((t) => t ?? null), [tripId])
  const expenses = useLiveQuery(
    () => db.expenses.where('tripId').equals(tripId).sortBy('purchasedAt'),
    [tripId],
  )
  const [receipts, setReceipts] = useState(new Map<string, Blob>())
  const [exportFile, setExportFile] = useState<File>()
  const [viewing, setViewing] = useState<Expense | null>(null)
  const [deleting, setDeleting] = useState<Expense | null>(null)
  const [sharing, setSharing] = useState(false)

  // Load the photos and build the zip ahead of time: iOS only opens the share
  // sheet if share() is called straight from the tap, with no slow work first
  useEffect(() => {
    if (!trip || !expenses?.length) return
    let cancelled = false
    loadReceipts(expenses.map((e) => e.id)).then(async (loaded) => {
      const file = await buildTripExport(trip, expenses, loaded)
      if (cancelled) return
      setReceipts(loaded)
      setExportFile(file)
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

  async function confirmDelete() {
    if (!deleting) return
    const tripRemoved = await deleteExpense(deleting)
    setDeleting(null)
    if (tripRemoved) navigate('/')
  }

  return (
    <main className="content narrow">
      <TripSummary trip={trip} expenses={expenses} />

      <ul className="expense-list">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            hasReceipt={expense.hasReceipt}
            onShowReceipt={() => setViewing(expense)}
            onDelete={() => setDeleting(expense)}
          />
        ))}
      </ul>

      <div className="trip-overview__share">
        <Button icon={<ShareIcon />} onClick={() => setSharing(true)}>
          Share
        </Button>
      </div>

      <ReceiptDialog
        image={viewing ? receipts.get(viewing.id) : undefined}
        title={viewing?.company ?? ''}
        onClose={() => setViewing(null)}
      />

      <ShareDialog
        open={sharing}
        trip={trip}
        expenses={expenses}
        receipts={receipts}
        exportFile={exportFile}
        onClose={() => setSharing(false)}
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
            {expenses.length === 1 && (
              <p>It's the only expense on this trip, so the trip will be deleted too.</p>
            )}
          </>
        )}
      </ConfirmDialog>
    </main>
  )
}

export default TripOverviewPage
