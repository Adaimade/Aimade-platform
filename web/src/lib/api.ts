import { useAuth } from '@clerk/clerk-react'

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8787/v1'

// Low-level fetch with Clerk JWT attached
export async function apiFetch<T>(
  path: string,
  getToken: () => Promise<string | null>,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 204) return null as T

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }

  return res.json()
}

// Hook: returns a pre-bound fetch function (inject into useQuery/useMutation)
export function useApi() {
  const { getToken } = useAuth()
  return <T>(path: string, options?: RequestInit) =>
    apiFetch<T>(path, getToken, options)
}
