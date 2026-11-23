const API_BASE_URL = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? '/api' : 'http://localhost:8080')).replace(/\/$/, '')
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
    throw new Error('Falha de conexão com a API. Verifique se o backend está ativo e a configuração do proxy.')
  }

  const responseText = await response.text()
  let body: unknown = null
  if (responseText) {
    try {
      body = JSON.parse(responseText)
    } catch {
      body = responseText
    }
  }

  if (!response.ok) {
    const payload = typeof body === 'object' && body !== null ? body as Record<string, unknown> : null
    const validationErrors = payload?.errors
    const details = Array.isArray(validationErrors)
      ? validationErrors.map((error) => typeof error === 'string' ? error : JSON.stringify(error)).join('; ')
      : undefined
    const message = payload?.message ?? payload?.mensagem ?? payload?.detail ?? payload?.title ?? details ?? body
    throw new Error(typeof message === 'string' ? message : `Erro na requisição (${response.status})`)
  }

  if (body === null) return undefined as T
  if (typeof body === 'string') throw new Error('A API retornou uma resposta em formato inválido.')
  return body as T
}
