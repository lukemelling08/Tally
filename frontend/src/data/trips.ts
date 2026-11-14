export type TransactionStatus = 'expensed' | 'pending'

export interface Transaction {
  id: string
  company: string
  recharge: number
  gross: number
  purchasedAt: string
  status: TransactionStatus
}

export interface Trip {
  id: string
  from: string
  to: string
  start: string
  end: string
  transactions: Transaction[]
}

export const totalGross = (transactions: Transaction[]) =>
  transactions.reduce((sum, t) => sum + t.gross, 0)

// A trip stays pending until every transaction on it has been expensed
export const tripStatus = (trip: Trip): TransactionStatus =>
  trip.transactions.some((t) => t.status === 'pending') ? 'pending' : 'expensed'

// Placeholder data until there's a backend. Recharge is mocked as gross ex-VAT.
let nextId = 0
const tx = (
  company: string,
  gross: number,
  purchasedAt: string,
  status: TransactionStatus,
): Transaction => ({
  id: String(++nextId),
  company,
  recharge: Math.round((gross / 1.2) * 100) / 100,
  gross,
  purchasedAt,
  status,
})

export const TRIPS: Trip[] = [
  {
    id: 'ncl-cov-nov',
    from: 'NCL',
    to: 'COV',
    start: '2026-11-03',
    end: '2026-11-07',
    transactions: [
      tx('PRET A MANGER', 6.85, '2026-11-03T07:42', 'pending'),
      tx('LNER', 84.2, '2026-11-03T08:05', 'pending'),
      tx('PREMIER INN', 312.0, '2026-11-03T18:31', 'pending'),
      tx('UBER', 14.6, '2026-11-04T08:47', 'pending'),
      tx('COSTA COFFEE', 3.95, '2026-11-05T12:10', 'pending'),
      tx('LNER', 84.2, '2026-11-07T16:58', 'pending'),
    ],
  },
  {
    id: 'man-lhr-oct',
    from: 'MAN',
    to: 'LHR',
    start: '2026-10-20',
    end: '2026-10-22',
    transactions: [
      tx('BRITISH AIRWAYS', 148.5, '2026-10-20T06:15', 'pending'),
      tx('HEATHROW EXPRESS', 25.0, '2026-10-20T09:02', 'pending'),
      tx('HILTON', 389.4, '2026-10-20T19:44', 'expensed'),
      tx('DISHOOM', 42.75, '2026-10-21T20:13', 'expensed'),
      tx('BRITISH AIRWAYS', 148.5, '2026-10-22T17:30', 'expensed'),
    ],
  },
  {
    id: 'edi-bhx-oct',
    from: 'EDI',
    to: 'BHX',
    start: '2026-10-06',
    end: '2026-10-09',
    transactions: [
      tx('EASYJET', 96.99, '2026-10-06T07:20', 'expensed'),
      tx('NATIONAL EXPRESS', 8.4, '2026-10-06T10:05', 'expensed'),
      tx('TRAVELODGE', 207.0, '2026-10-06T17:52', 'expensed'),
      tx('WAGAMAMA', 21.3, '2026-10-07T19:26', 'expensed'),
    ],
  },
  {
    id: 'lba-brs-sep',
    from: 'LBA',
    to: 'BRS',
    start: '2026-09-22',
    end: '2026-09-23',
    transactions: [
      tx('SHELL', 68.12, '2026-09-22T06:48', 'expensed'),
      tx('GREGGS', 4.15, '2026-09-22T09:31', 'expensed'),
      tx('IBIS', 94.0, '2026-09-22T18:05', 'expensed'),
    ],
  },
  {
    id: 'gla-lhr-sep',
    from: 'GLA',
    to: 'LHR',
    start: '2026-09-08',
    end: '2026-09-12',
    transactions: [
      tx('BRITISH AIRWAYS', 1210.0, '2026-09-08T06:40', 'expensed'),
      tx('ELIZABETH LINE', 13.2, '2026-09-08T09:15', 'expensed'),
      tx('CITIZENM', 846.0, '2026-09-08T15:22', 'expensed'),
      tx('PRET A MANGER', 7.9, '2026-09-09T08:03', 'expensed'),
      tx('ADDISON LEE', 38.5, '2026-09-10T22:41', 'expensed'),
      tx('LEON', 11.45, '2026-09-11T12:57', 'expensed'),
      tx('BRITISH AIRWAYS', 1210.0, '2026-09-12T18:10', 'expensed'),
    ],
  },
  {
    id: 'ncl-abz-aug',
    from: 'NCL',
    to: 'ABZ',
    start: '2026-08-17',
    end: '2026-08-19',
    transactions: [
      tx('LOGANAIR', 132.0, '2026-08-17T07:05', 'expensed'),
      tx('COMPASS TAXIS', 22.0, '2026-08-17T08:40', 'expensed'),
      tx('MOXY', 178.0, '2026-08-17T17:59', 'expensed'),
      tx('NANDOS', 18.6, '2026-08-18T19:34', 'expensed'),
      tx('LOGANAIR', 132.0, '2026-08-19T18:20', 'expensed'),
    ],
  },
  {
    id: 'bhx-man-jul',
    from: 'BHX',
    to: 'MAN',
    start: '2026-07-28',
    end: '2026-07-29',
    transactions: [
      tx('AVANTI WEST COAST', 56.3, '2026-07-28T07:12', 'expensed'),
      tx('CAFFE NERO', 3.6, '2026-07-28T08:55', 'expensed'),
      tx('PREMIER INN', 109.0, '2026-07-28T18:14', 'expensed'),
      tx('AVANTI WEST COAST', 56.3, '2026-07-29T17:45', 'expensed'),
    ],
  },
  {
    id: 'cov-edi-jul',
    from: 'COV',
    to: 'EDI',
    start: '2026-07-06',
    end: '2026-07-10',
    transactions: [
      tx('LNER', 142.8, '2026-07-06T06:58', 'expensed'),
      tx('LOTHIAN BUSES', 2.0, '2026-07-06T12:30', 'expensed'),
      tx('MALMAISON', 596.0, '2026-07-06T15:08', 'expensed'),
      tx('WAITROSE', 9.85, '2026-07-07T07:44', 'expensed'),
      tx('LNER', 142.8, '2026-07-10T16:20', 'expensed'),
    ],
  },
]
