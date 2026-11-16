import { packBundle, unpackBundle } from './bundle'
import { db, type Allowance, type Expense, type Trip } from './db'
import { todayLocal } from './format'

// The data download is a bundle of everything on the device. Loading one
// replaces all local data, which is how data moves between phones.

const FORMAT = 'tally-sync'
const VERSION = 1

interface SyncData {
  format: typeof FORMAT
  version: number
  exportedAt: string
  trips: Trip[]
  expenses: Expense[]
  allowances: Allowance[]
}

export interface SyncContents {
  data: SyncData
  receipts: Map<string, Blob>
}

export async function buildSyncFile() {
  const [trips, expenses, allowances, receipts] = await Promise.all([
    db.trips.toArray(),
    db.expenses.toArray(),
    db.allowances.toArray(),
    db.receipts.toArray(),
  ])
  const data: SyncData = {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    trips,
    expenses,
    allowances,
  }
  const zip = await packBundle(data, new Map(receipts.map((r) => [r.expenseId, r.image])))
  return new File([zip], `tally-data_${todayLocal()}.zip`, { type: 'application/zip' })
}

// Throws with a readable message if the file isn't a Tally data file
export async function readSyncFile(file: File): Promise<SyncContents> {
  const bundle = unpackBundle(new Uint8Array(await file.arrayBuffer()))
  const data = bundle?.data as SyncData | undefined
  if (
    !bundle ||
    data?.format !== FORMAT ||
    !Array.isArray(data.trips) ||
    !Array.isArray(data.expenses) ||
    !Array.isArray(data.allowances)
  ) {
    throw new Error("This file isn't a Tally data file.")
  }
  if (data.version > VERSION) {
    throw new Error('This file is from a newer version of Tally. Update the app and try again.')
  }
  return { data, receipts: bundle.receipts }
}

// Wipes this device and loads the file's data in one transaction,
// so a failure part-way leaves the existing data untouched
export function applySync({ data, receipts }: SyncContents) {
  return db.transaction('rw', db.trips, db.expenses, db.receipts, db.allowances, async () => {
    await Promise.all([db.trips.clear(), db.expenses.clear(), db.receipts.clear(), db.allowances.clear()])
    await db.trips.bulkAdd(data.trips)
    await db.expenses.bulkAdd(data.expenses)
    await db.allowances.bulkAdd(data.allowances)
    await db.receipts.bulkAdd([...receipts].map(([expenseId, image]) => ({ expenseId, image })))
  })
}
