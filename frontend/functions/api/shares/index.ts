// POST /api/shares: stores an encrypted trip and returns its id.
// The body is already encrypted on the phone; this never sees the key.

interface Env {
  SHARES: KVNamespace
}

const MAX_BYTES = 20 * 1024 * 1024
const TTL_SECONDS = 30 * 24 * 60 * 60

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store' } })

// 128 random bits, base64url: unguessable, so the link itself is the permission
function randomId() {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) {
    return json({ error: 'Trip is too large to share' }, 413)
  }
  const body = await request.arrayBuffer()
  if (body.byteLength === 0 || body.byteLength > MAX_BYTES) {
    return json({ error: 'Trip is empty or too large to share' }, 413)
  }

  const id = randomId()
  const expiresAt = new Date(Date.now() + TTL_SECONDS * 1000).toISOString()
  await env.SHARES.put(id, body, { expirationTtl: TTL_SECONDS, metadata: { expiresAt } })
  return json({ id, expiresAt }, 201)
}
