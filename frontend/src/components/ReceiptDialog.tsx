import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef } from 'react'
import { db } from '../db'
import { useObjectUrl } from '../images'
import Button from './Button'
import { CloseIcon } from './icons'
import './ReceiptDialog.css'

interface ReceiptDialogProps {
  expenseId: string | null
  title: string
  onClose: () => void
}

// Full-screen preview of a stored receipt photo; open while expenseId is set
function ReceiptDialog({ expenseId, title, onClose }: ReceiptDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const receipt = useLiveQuery(
    () => (expenseId ? db.receipts.get(expenseId) : undefined),
    [expenseId],
  )
  const imageUrl = useObjectUrl(receipt?.image)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (expenseId && !dialog.open) dialog.showModal()
    if (!expenseId && dialog.open) dialog.close()
  }, [expenseId])

  return (
    <dialog
      ref={dialogRef}
      className="receipt-dialog"
      aria-label={`Receipt for ${title}`}
      onClose={onClose}
      // Tapping the dimmed backdrop closes it
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close()
      }}
    >
      <div className="receipt-dialog__panel">
        <div className="receipt-dialog__bar">
          <span className="receipt-dialog__title">{title}</span>
          <Button
            variant="ghost"
            size="small"
            icon={<CloseIcon />}
            aria-label="Close receipt"
            onClick={() => dialogRef.current?.close()}
          />
        </div>
        {imageUrl ? (
          <img src={imageUrl} alt={`Receipt for ${title}`} className="receipt-dialog__image" />
        ) : (
          <p className="receipt-dialog__empty">Loading receipt…</p>
        )}
      </div>
    </dialog>
  )
}

export default ReceiptDialog
