// GET /api/shares/:id: returns a stored (still encrypted) trip.

interface Env {
  SHARES: KVNamespace
}

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = String(params.id)
  if (!/^[A-Za-z0-9_-]{22}$/.test(id)) return new Response('Not found', { status: 404 })

  const { value, metadata } = await env.SHARES.getWithMetadata<{ expiresAt: string }>(
    id,
    'arrayBuffer',
  )
  if (!value) return new Response('Not found', { status: 404 })

  return new Response(value, {
    headers: {
      'content-type': 'application/octet-stream',
      'cache-control': 'private, no-store',
      'x-expires-at': metadata?.expiresAt ?? '',
    },
  })
}
