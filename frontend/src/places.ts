// Three-letter shorthand for place names, e.g. Newcastle -> NCL.
// Known places use their familiar (mostly National Rail) codes; anything else
// is abbreviated by rule.
const KNOWN_CODES: Record<string, string> = {
  aberdeen: 'ABD',
  bath: 'BTH',
  belfast: 'BEL',
  birmingham: 'BHM',
  bournemouth: 'BMH',
  brighton: 'BTN',
  bristol: 'BRI',
  cambridge: 'CBG',
  cardiff: 'CDF',
  carlisle: 'CAR',
  coventry: 'COV',
  darlington: 'DAR',
  derby: 'DBY',
  dundee: 'DEE',
  durham: 'DHM',
  edinburgh: 'EDB',
  exeter: 'EXD',
  gatwick: 'LGW',
  glasgow: 'GLA',
  heathrow: 'LHR',
  hull: 'HUL',
  inverness: 'INV',
  lancaster: 'LAN',
  leeds: 'LDS',
  leicester: 'LEI',
  liverpool: 'LIV',
  london: 'LON',
  luton: 'LTN',
  manchester: 'MAN',
  middlesbrough: 'MBR',
  'milton keynes': 'MKC',
  newcastle: 'NCL',
  norwich: 'NRW',
  nottingham: 'NOT',
  oxford: 'OXF',
  peterborough: 'PBO',
  plymouth: 'PLY',
  portsmouth: 'PMS',
  preston: 'PRE',
  reading: 'RDG',
  sheffield: 'SHF',
  southampton: 'SOU',
  stansted: 'STN',
  stoke: 'SOT',
  'stoke-on-trent': 'SOT',
  sunderland: 'SUN',
  swansea: 'SWA',
  wolverhampton: 'WVH',
  york: 'YRK',
}

const isConsonant = (c: string) => /[bcdfgjklmnpqrstvxz]/.test(c)

export function placeCode(name: string) {
  const trimmed = name.trim()
  const key = trimmed.toLowerCase()
  if (KNOWN_CODES[key]) return KNOWN_CODES[key]
  if (/^[a-z]{1,3}$/i.test(trimmed)) return trimmed.toUpperCase()

  const words = key.split(/[\s-]+/).filter(Boolean)
  if (words.length > 1) {
    // Initials, topped up from the last word: "Milton Keynes" -> MKE
    const initials = words.map((w) => w[0]).join('')
    return (initials + words.at(-1)!.slice(1)).slice(0, 3).toUpperCase()
  }

  // First letter, first consonant after it, last consonant: Harrogate -> HRT
  const letters = key.replace(/[^a-z]/g, '')
  const rest = [...letters.slice(1)]
  const second = rest.find(isConsonant)
  const last = rest.findLast(isConsonant)
  const code =
    second && last && rest.lastIndexOf(last) > rest.indexOf(second)
      ? letters[0] + second + last
      : letters.slice(0, 3)
  return code.toUpperCase()
}

// "NCL → COV"
export const tripRoute = (from: string, to: string) => `${placeCode(from)} → ${placeCode(to)}`
