const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'https://foneflex-backend.onrender.com').replace(/\/$/, '')
let credentials: { username: string; password: string } | null = null

export function setApiCredentials(username: string, password: string) {
  credentials = { username, password }
}

export function clearApiCredentials() {
  credentials = null
}

function basicAuthHeader() {
  if (!credentials) return undefined
  const bytes = new TextEncoder().encode(`${credentials.username}:${credentials.password}`)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return `Basic ${btoa(binary)}`
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(basicAuthHeader() ? { Authorization: basicAuthHeader() } : {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })

  const body = await response.json().catch(() => null) as { message?: string; mensagem?: string } | null
  if (!response.ok) {
    throw new Error(body?.message ?? body?.mensagem ?? `Erro na requisição (${response.status})`)
  }

  return body as T
}
