import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate'

// A bundle is a zip of data.json plus receipts/<expense id>.<ext>. Used for
// the device data download and for encrypted share links.

export const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/webp': 'webp',
}

const TYPES = Object.fromEntries(Object.entries(EXTENSIONS).map(([type, ext]) => [ext, type]))

export async function packBundle(data: object, receipts: Map<string, Blob>) {
  const files: Zippable = { 'data.json': strToU8(JSON.stringify(data)) }
  for (const [expenseId, image] of receipts) {
    const ext = EXTENSIONS[image.type] ?? 'jpg'
    // Photos are already compressed, so store them as-is
    files[`receipts/${expenseId}.${ext}`] = [new Uint8Array(await image.arrayBuffer()), { level: 0 }]
  }
  return zipSync(files)
}

// Returns undefined if the bytes aren't a bundle
export function unpackBundle(bytes: Uint8Array) {
  let entries: Record<string, Uint8Array>
  try {
    entries = unzipSync(bytes)
  } catch {
    return undefined
  }
  const json = entries['data.json']
  if (!json) return undefined

  const receipts = new Map<string, Blob>()
  for (const [path, file] of Object.entries(entries)) {
    const match = path.match(/^receipts\/(.+)\.(\w+)$/)
    if (match) {
      receipts.set(match[1], new Blob([new Uint8Array(file)], { type: TYPES[match[2]] ?? 'image/jpeg' }))
    }
  }
  return { data: JSON.parse(strFromU8(json)) as unknown, receipts }
}
