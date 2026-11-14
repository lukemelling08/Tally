const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

// Amounts are stored in pence: 123456 -> £1,234.56
export const formatGBP = (pence: number) => gbp.format(pence / 100)

// '12.5' -> 1250
export const toPence = (value: string) => Math.round(Number.parseFloat(value) * 100)

// Dates are local ISO strings ('2026-11-03'), sliced
// directly so formatting never shifts across timezones.

// 03/11
export const formatDayMonth = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// 03/11 - 07/11 '26
export const formatDateRange = (start: string, end: string) =>
  `${formatDayMonth(start)} - ${formatDayMonth(end)} '${end.slice(2, 4)}`

const pad = (n: number) => String(n).padStart(2, '0')

// Today as YYYY-MM-DD in local time
export function todayLocal() {
  const now = new Date()
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
