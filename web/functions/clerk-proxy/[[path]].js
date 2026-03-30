export async function onRequest(context) {
  const url = new URL(context.request.url)
  const targetPath = url.pathname.replace('/clerk-proxy', '') || '/'
  const targetUrl = 'https://frontend-api.clerk.services' + targetPath + url.search

  const headers = {}
  for (const [key, value] of context.request.headers) {
    const lower = key.toLowerCase()
    if (!['host', 'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'x-forwarded-for', 'x-forwarded-proto'].includes(lower)) {
      headers[key] = value
    }
  }

  try {
    const response = await fetch(targetUrl, {
      method: context.request.method,
      headers,
      body: ['GET', 'HEAD'].includes(context.request.method) ? undefined : context.request.body,
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    })
  } catch (e) {
    return new Response('Proxy error: ' + e.message, { status: 502 })
  }
}
