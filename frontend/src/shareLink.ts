import { packBundle, unpackBundle } from './bundle'
import type { Expense, Trip } from './db'

// "Share via Tally": the trip is encrypted on this device, uploaded, and the
// key is put in the link's #fragment. Browsers never send the fragment to the
// server, so Cloudflare only ever stores data it can't read.

const FORMAT = 'tally-share'
const VERSION = 1

export interface SharedTrip {
  trip: Trip
  expenses: Expense[]
  receipts: Map<string, Blob>
  expiresAt: string
}

interface ShareData {
  format: typeof FORMAT
  version: number
  trip: Trip
  expenses: Expense[]
}

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

const fromBase64Url = (text: string) =>
  Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))

// Returns the link and when it expires
export async function createShareLink(trip: Trip, expenses: Expense[], receipts: Map<string, Blob>) {
  const data: ShareData = { format: FORMAT, version: VERSION, trip, expenses }
  const plain = await packBundle(data, receipts)

  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt'])
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain))
  const body = new Uint8Array(iv.length + cipher.length)
  body.set(iv)
  body.set(cipher, iv.length)

  const response = await fetch('/api/shares', {
    method: 'POST',
    headers: { 'content-type': 'application/octet-stream' },
    body,
  })
  if (!response.ok) throw new Error(`Upload failed (${response.status})`)
  const { id, expiresAt } = (await response.json()) as { id: string; expiresAt: string }

  const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', key))
  return { url: `${location.origin}/s/${id}#${toBase64Url(rawKey)}`, expiresAt }
}

// Throws with a readable message if the link is wrong, expired or offline
export async function loadSharedTrip(id: string, keyText: string): Promise<SharedTrip> {
  let response: Response
  try {
    response = await fetch(`/api/shares/${encodeURIComponent(id)}`)
  } catch {
    throw new Error('You need an internet connection to open this trip.')
  }
  if (response.status === 404) throw new Error('This link has expired or doesn’t exist.')
  if (!response.ok) throw new Error('Couldn’t load this trip. Please try again.')

  const body = new Uint8Array(await response.arrayBuffer())
  let plain: Uint8Array
  try {
    const key = await crypto.subtle.importKey('raw', fromBase64Url(keyText), 'AES-GCM', false, ['decrypt'])
    plain = new Uint8Array(
      await crypto.subtle.decrypt({ name: 'AES-GCM', iv: body.slice(0, 12) }, key, body.slice(12)),
    )
  } catch {
    throw new Error('This link is incomplete. Ask for it to be sent again.')
  }

  const bundle = unpackBundle(plain)
  const data = bundle?.data as ShareData | undefined
  if (!bundle || data?.format !== FORMAT) throw new Error('Couldn’t read this trip.')
  return {
    trip: data.trip,
    expenses: data.expenses,
    receipts: bundle.receipts,
    expiresAt: response.headers.get('x-expires-at') ?? '',
  }
}
