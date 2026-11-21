import { createContext, useContext, useState, type ReactNode } from 'react'
import { clearApiCredentials, setApiCredentials } from './api'

export type User = { name: string; role: string; initials: string }

type AuthValue = { user: User | null; login: (email: string, senha: string) => boolean; logout: () => void }

const AuthContext = createContext<AuthValue | null>(null)

/* Autenticação simulada (Fase 1 sem back-end): qualquer e-mail e senha preenchidos entram. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = (email: string, senha: string) => {
    if (!email.trim() || !senha.trim()) return false
    setApiCredentials(email.trim(), senha)
    const u = { name: 'FONEFLEX', role: 'OPERADOR GENERICO', initials: 'FF' }
    setUser(u)
    return true
  }
  const logout = () => {
    clearApiCredentials()
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth fora do AuthProvider')
  return ctx
}
