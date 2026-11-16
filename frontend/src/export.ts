import { strToU8, zipSync, type Zippable } from 'fflate'
import { EXTENSIONS } from './bundle'
import type { Expense, Trip } from './db'
import { placeCode } from './places'

// 2026-11-03 -> 03/11/2026, which UK spreadsheets read as a date
const ukDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`

const pounds = (pence: number) => (pence / 100).toFixed(2)

// Quote fields that need it, and stop spreadsheets running text as a formula
function csvField(value: string) {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

const fileSafe = (text: string) =>
  text
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'receipt'

// COV_2026-11-03_to_2026-11-07
export const exportName = (trip: Trip) =>
  `${placeCode(trip.destination)}_${trip.start}_to_${trip.end}`

// A zip holding a CSV of the trip's expenses plus a receipts/ folder of photos
export async function buildTripExport(trip: Trip, expenses: Expense[], receipts: Map<string, Blob>) {
  const name = exportName(trip)
  const files: Zippable = {}

  const header = ['Date', 'Business', 'Details', 'Recharge (£)', 'Gross (£)', 'Status', 'Receipt']
  const rows = await Promise.all(
    expenses.map(async (expense, i) => {
      const image = receipts.get(expense.id)
      let receiptPath = ''
      if (image) {
        const ext = EXTENSIONS[image.type] ?? 'jpg'
        const number = String(i + 1).padStart(2, '0')
        receiptPath = `receipts/${number}_${expense.purchasedAt}_${fileSafe(expense.company)}.${ext}`
        // Photos are already compressed, so store them as-is
        files[receiptPath] = [new Uint8Array(await image.arrayBuffer()), { level: 0 }]
      }
      return [
        ukDate(expense.purchasedAt),
        expense.company,
        expense.details,
        pounds(expense.recharge),
        pounds(expense.gross),
        expense.status === 'pending' ? 'Pending' : 'Expensed',
        receiptPath,
      ]
    }),
  )

  const csv = [header, ...rows].map((row) => row.map(csvField).join(',')).join('\r\n')
  // The byte-order mark makes Excel read £ correctly
  files[`${name}.csv`] = strToU8(`﻿${csv}\r\n`)

  return new File([zipSync(files)], `${name}.zip`, { type: 'application/zip' })
}

export function downloadFile(file: File) {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// Opens the phone's share sheet (Save to Files, Mail, AirDrop…), or downloads
// the file where sharing files isn't supported
export async function shareFile(file: File) {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: file.name })
      return
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
    }
  }
  downloadFile(file)
}
