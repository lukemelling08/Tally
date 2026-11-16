import type { Expense } from '../db'
import { formatDayMonth, formatGBP } from '../format'
import Button from './Button'
import { ReceiptIcon, TrashIcon } from './icons'
import './TripDetails.css'

interface ExpenseCardProps {
  expense: Expense
  hasReceipt: boolean
  onShowReceipt: () => void
  // Left out for read-only views such as shared links
  onDelete?: () => void
}

// Mini version of the trip card, one per purchase
function ExpenseCard({ expense, hasReceipt, onShowReceipt, onDelete }: ExpenseCardProps) {
  return (
    <li className="expense-card">
      <div className="expense-card__row">
        <span className="expense-card__company">{expense.company}</span>
        <span className="expense-card__amount">{formatGBP(expense.gross)}</span>
      </div>
      {expense.details && <p className="expense-card__details">{expense.details}</p>}
      <div className="expense-card__row">
        <time className="expense-card__time" dateTime={expense.purchasedAt}>
          {formatDayMonth(expense.purchasedAt)}
        </time>
        {hasReceipt ? (
          <Button
            variant="ghost"
            size="small"
            icon={<ReceiptIcon />}
            aria-label={`Receipt for ${expense.company}`}
            onClick={onShowReceipt}
          >
            Receipt
          </Button>
        ) : (
          <span className="expense-card__no-receipt">No receipt</span>
        )}
      </div>
      {onDelete && (
        <Button
          variant="danger"
          size="small"
          icon={<TrashIcon />}
          aria-label={`Delete expense: ${expense.company}`}
          onClick={onDelete}
        >
          Delete expense
        </Button>
      )}
    </li>
  )
}

export default ExpenseCard
