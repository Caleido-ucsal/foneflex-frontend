const API_BASE_URL = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '/api' : 'https://foneflex-backend.onrender.com')).replace(/\/$/, '')
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
  const headers = new Headers(init.headers)
  const authorization = basicAuthHeader()
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (authorization) headers.set('Authorization', authorization)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new Error('Falha de conexão com a API. Verifique a rede e a configuração de CORS do backend.')
  }

  const body = await response.json().catch(() => null) as { message?: string; mensagem?: string } | null
  if (!response.ok) {
    throw new Error(body?.message ?? body?.mensagem ?? `Erro na requisição (${response.status})`)
  }

  return body as T
}
