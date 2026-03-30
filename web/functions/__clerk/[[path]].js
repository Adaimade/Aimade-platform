export async function onRequest({ request, params }) {
  const path = params.path ? params.path.join('/') : ''
  const url = new URL(request.url)

  const clerkUrl = new URL(`https://frontend-api.clerk.services/${path}`)
  clerkUrl.search = url.search

  const headers = new Headers(request.headers)
  headers.set('host', 'frontend-api.clerk.services')

  const response = await fetch(clerkUrl.toString(), {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD'
      ? request.body
      : undefined,
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}
