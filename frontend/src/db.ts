import Dexie, { type EntityTable } from 'dexie'

// Everything lives on the device in IndexedDB. Amounts are stored in pence
// so totals never pick up floating-point rounding errors.

export type ExpenseStatus = 'pending' | 'expensed'

export interface Trip {
  id: string
  from: string
  to: string
  start: string // YYYY-MM-DD
  end: string
  createdAt: string
}

export interface Expense {
  id: string
  tripId: string
  company: string
  recharge: number
  gross: number
  purchasedAt: string // YYYY-MM-DD
  details: string // An allowance name, or empty
  status: ExpenseStatus
  hasReceipt: boolean
}

// Kept apart from expenses so lists never load the images
export interface Receipt {
  expenseId: string
  image: Blob
}

export interface Allowance {
  id: string
  name: string
  amount: number
  createdAt: string
}

export const db = new Dexie('tally') as Dexie & {
  trips: EntityTable<Trip, 'id'>
  expenses: EntityTable<Expense, 'id'>
  receipts: EntityTable<Receipt, 'expenseId'>
  allowances: EntityTable<Allowance, 'id'>
}

db.version(1).stores({
  trips: 'id, start',
  expenses: 'id, tripId',
  receipts: 'expenseId',
  allowances: 'id, createdAt',
})

// randomUUID needs a secure context, which a dev server on the LAN isn't
export const newId = () =>
  crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export const totalGross = (expenses: Expense[]) =>
  expenses.reduce((sum, e) => sum + e.gross, 0)

// A trip stays pending until every expense on it has been expensed
export const tripStatus = (expenses: Expense[]): ExpenseStatus =>
  expenses.some((e) => e.status === 'pending') ? 'pending' : 'expensed'

// Most recent trips first
export const sortTrips = (trips: Trip[]) =>
  [...trips].sort((a, b) => b.start.localeCompare(a.start) || b.createdAt.localeCompare(a.createdAt))

export function groupByTrip(expenses: Expense[]) {
  const groups = new Map<string, Expense[]>()
  for (const expense of expenses) {
    const group = groups.get(expense.tripId) ?? []
    group.push(expense)
    groups.set(expense.tripId, group)
  }
  for (const group of groups.values()) {
    group.sort((a, b) => a.purchasedAt.localeCompare(b.purchasedAt))
  }
  return groups
}

interface NewExpense {
  newTrip?: Omit<Trip, 'id' | 'createdAt'>
  tripId?: string
  expense: Omit<Expense, 'id' | 'tripId' | 'status' | 'hasReceipt'>
  receipt?: Blob
}

// Creates the trip too when needed, all in one transaction. Returns the trip id.
export function addExpense({ newTrip, tripId, expense, receipt }: NewExpense) {
  return db.transaction('rw', db.trips, db.expenses, db.receipts, async () => {
    const now = new Date().toISOString()
    const id = tripId ?? newId()
    if (newTrip) await db.trips.add({ ...newTrip, id, createdAt: now })

    const expenseId = newId()
    await db.expenses.add({
      ...expense,
      id: expenseId,
      tripId: id,
      status: 'pending',
      hasReceipt: Boolean(receipt),
    })
    if (receipt) await db.receipts.add({ expenseId, image: receipt })
    return id
  })
}

// Removes an expense and its receipt, and the trip too if it's now empty.
// Returns true when the trip was removed.
export function deleteExpense(expense: Expense) {
  return db.transaction('rw', db.trips, db.expenses, db.receipts, async () => {
    await db.expenses.delete(expense.id)
    await db.receipts.delete(expense.id)
    const remaining = await db.expenses.where('tripId').equals(expense.tripId).count()
    if (remaining === 0) await db.trips.delete(expense.tripId)
    return remaining === 0
  })
}
