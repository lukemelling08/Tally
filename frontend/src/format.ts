const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' })

// £1,234.56
export const formatGBP = (amount: number) => gbp.format(amount)

// Dates are local ISO strings ('2026-11-03' or '2026-11-03T08:14'), sliced
// directly so formatting never shifts across timezones.

// 03/11
export const formatDayMonth = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// 03/11 08:14
export const formatDateTime = (iso: string) => `${formatDayMonth(iso)} ${iso.slice(11, 16)}`

// 03/11 - 07/11 '26
export const formatDateRange = (start: string, end: string) =>
  `${formatDayMonth(start)} - ${formatDayMonth(end)} '${end.slice(2, 4)}`
