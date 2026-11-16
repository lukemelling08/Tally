import { useEffect, useState } from 'react'
import Button from '../components/Button'
import ExpenseCard from '../components/ExpenseCard'
import ReceiptDialog from '../components/ReceiptDialog'
import TripSummary from '../components/TripSummary'
import { DownloadIcon, WarningIcon } from '../components/icons'
import type { Expense } from '../db'
import { buildTripExport, downloadFile } from '../export'
import { loadSharedTrip, type SharedTrip } from '../shareLink'

// Read-only view of a trip someone shared with a link. Nothing is saved to
// this device; the trip is decrypted with the key in the link's #fragment.
function SharedTripPage({ shareId }: { shareId: string }) {
  const [shared, setShared] = useState<SharedTrip>()
  const [exportFile, setExportFile] = useState<File>()
  const [error, setError] = useState<string>()
  const [viewing, setViewing] = useState<Expense | null>(null)

  useEffect(() => {
    let cancelled = false
    const key = window.location.hash.slice(1)
    loadSharedTrip(shareId, key)
      .then(async (result) => {
        const file = await buildTripExport(result.trip, result.expenses, result.receipts)
        if (cancelled) return
        setShared(result)
        setExportFile(file)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [shareId])

  if (error) {
    return (
      <main className="content narrow">
        <h1 className="page-title">Can't open this trip</h1>
        <p className="field-warning" role="status">
          <WarningIcon />
          <span>{error}</span>
        </p>
      </main>
    )
  }

  if (!shared) {
    return (
      <main className="content narrow">
        <p className="field__hint shared-trip__loading">Loading trip…</p>
      </main>
    )
  }

  const { trip, expenses, receipts } = shared

  return (
    <main className="content narrow">
      <TripSummary trip={trip} expenses={expenses} />

      <ul className="expense-list">
        {expenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            hasReceipt={receipts.has(expense.id)}
            onShowReceipt={() => setViewing(expense)}
          />
        ))}
      </ul>

      <div className="trip-overview__share">
        <Button
          icon={<DownloadIcon />}
          disabled={!exportFile}
          onClick={() => exportFile && downloadFile(exportFile)}
        >
          Download
        </Button>
      </div>

      <ReceiptDialog
        image={viewing ? receipts.get(viewing.id) : undefined}
        title={viewing?.company ?? ''}
        onClose={() => setViewing(null)}
      />
    </main>
  )
}

export default SharedTripPage
