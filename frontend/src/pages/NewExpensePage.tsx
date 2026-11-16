import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState, type FormEvent } from 'react'
import Button from '../components/Button'
import { CameraIcon, CloseIcon, WarningIcon } from '../components/icons'
import { addExpense, db, groupByTrip, sortTrips, tripStatus } from '../db'
import { formatDateRange, formatGBP, todayLocal, toPence } from '../format'
import { compressImage, useObjectUrl } from '../images'
import { placeCode } from '../places'
import { navigate } from '../router'
import './NewExpensePage.css'

const NEW_TRIP = 'new'

function NewExpensePage() {
  const trips = useLiveQuery(() => db.trips.toArray())
  const expenses = useLiveQuery(() => db.expenses.toArray())
  const allowances = useLiveQuery(() => db.allowances.orderBy('createdAt').toArray())

  const [tripChoice, setTripChoice] = useState<string>()
  const [tripStart, setTripStart] = useState(todayLocal)
  const [details, setDetails] = useState('')
  const [gross, setGross] = useState('')
  const [receiptFile, setReceiptFile] = useState<File>()
  const [saving, setSaving] = useState(false)
  const receiptInput = useRef<HTMLInputElement>(null)
  const receiptPreview = useObjectUrl(receiptFile)

  if (!trips || !expenses || !allowances) return <main className="content narrow" />

  const sortedTrips = sortTrips(trips)
  const byTrip = groupByTrip(expenses)

  // Default to the most recent pending trip, otherwise a new one
  const firstPending = sortedTrips.find((t) => tripStatus(byTrip.get(t.id) ?? []) === 'pending')
  const selectedTrip = tripChoice ?? firstPending?.id ?? NEW_TRIP
  const creatingTrip = selectedTrip === NEW_TRIP

  // Over-allowance is a warning only; it doesn't block saving
  const allowance = allowances.find((a) => a.name === details)
  const grossPence = gross ? toPence(gross) : 0
  const overBy = allowance && grossPence > allowance.amount ? grossPence - allowance.amount : 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const text = (name: string) => String(data.get(name) ?? '').trim()

    setSaving(true)
    try {
      const receipt = receiptFile ? await compressImage(receiptFile) : undefined
      const tripId = await addExpense({
        tripId: creatingTrip ? undefined : selectedTrip,
        newTrip: creatingTrip
          ? { destination: text('destination'), start: text('start'), end: text('end') }
          : undefined,
        expense: {
          purchasedAt: text('purchasedAt'),
          company: text('company'),
          details,
          recharge: toPence(text('recharge')),
          gross: grossPence,
        },
        receipt,
      })
      navigate(`/trips/${tripId}`)
    } catch (error) {
      setSaving(false)
      console.error(error)
      alert("Couldn't save this expense. Please try again.")
    }
  }

  return (
    <main className="content narrow">
      <h1 className="page-title">New expense</h1>

      <form className="expense-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="field">
            <label className="field__label" htmlFor="trip">
              Trip
            </label>
            <select
              id="trip"
              className="input"
              value={selectedTrip}
              onChange={(e) => setTripChoice(e.target.value)}
            >
              <option value={NEW_TRIP}>New trip</option>
              {sortedTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {placeCode(trip.destination)} · {formatDateRange(trip.start, trip.end)}
                </option>
              ))}
            </select>
          </div>

          {creatingTrip && (
            <>
              <div className="field">
                <label className="field__label" htmlFor="destination">
                  Destination
                </label>
                <input id="destination" name="destination" className="input" required />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field__label" htmlFor="start">
                    Start date
                  </label>
                  <input
                    id="start"
                    name="start"
                    className="input"
                    type="date"
                    value={tripStart}
                    onChange={(e) => setTripStart(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor="end">
                    End date
                  </label>
                  <input
                    id="end"
                    name="end"
                    className="input"
                    type="date"
                    defaultValue={todayLocal()}
                    min={tripStart}
                    required
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <fieldset className="form-section">
          <legend className="section-label">Expense</legend>

          <div className="field">
            <label className="field__label" htmlFor="purchasedAt">
              Date
            </label>
            <input
              id="purchasedAt"
              name="purchasedAt"
              className="input"
              type="date"
              defaultValue={todayLocal()}
              required
            />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="company">
              Business
            </label>
            <input id="company" name="company" className="input" required />
          </div>

          <div className="field">
            <label className="field__label" htmlFor="details">
              Details (optional)
            </label>
            <select
              id="details"
              className="input"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            >
              <option value="">None</option>
              {allowances.map((a) => (
                <option key={a.id} value={a.name}>
                  {a.name} ({formatGBP(a.amount)})
                </option>
              ))}
            </select>
            {allowances.length === 0 && (
              <p className="field__hint">Add allowances in Settings to choose them here.</p>
            )}
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor="recharge">
                Recharge (£)
              </label>
              <input
                id="recharge"
                name="recharge"
                className="input"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="gross">
                Gross (£)
              </label>
              <input
                id="gross"
                className={overBy ? 'input input--warning' : 'input'}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
                aria-describedby={overBy ? 'gross-warning' : undefined}
                required
              />
            </div>
          </div>
          {allowance && overBy > 0 && (
            <p id="gross-warning" className="field-warning" role="status">
              <WarningIcon />
              <span>
                {formatGBP(overBy)} over the {allowance.name} allowance of{' '}
                {formatGBP(allowance.amount)}. You can still save it.
              </span>
            </p>
          )}

          <div className="field">
            <span className="field__label">Receipt</span>
            {/* Without `capture`, iOS offers both the camera and the photo library */}
            <input
              ref={receiptInput}
              type="file"
              accept="image/*"
              className="visually-hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => setReceiptFile(e.target.files?.[0])}
            />
            {receiptPreview ? (
              <div className="receipt-preview">
                <img src={receiptPreview} alt="Selected receipt" className="receipt-preview__image" />
                <div className="receipt-preview__actions">
                  <Button variant="ghost" size="small" onClick={() => receiptInput.current?.click()}>
                    Change
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<CloseIcon />}
                    onClick={() => {
                      setReceiptFile(undefined)
                      if (receiptInput.current) receiptInput.current.value = ''
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                icon={<CameraIcon />}
                onClick={() => receiptInput.current?.click()}
              >
                Add receipt photo
              </Button>
            )}
          </div>
        </fieldset>

        <Button type="submit" variant="accent" disabled={saving} className="expense-form__submit">
          {saving ? 'Saving…' : creatingTrip ? 'Create trip and expense' : 'Create expense'}
        </Button>
      </form>
    </main>
  )
}

export default NewExpensePage
