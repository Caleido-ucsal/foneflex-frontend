import { createContext, useContext, useState, type ReactNode } from 'react'
import { clearApiCredentials, setApiCredentials } from './api'
import { listarUsuarios, type Usuario } from './usuarios'

export type User = { id: number; name: string; role: string; initials: string }

type AuthValue = { user: User | null; login: (email: string, senha: string) => Promise<void>; logout: () => void }

const AuthContext = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, senha: string) => {
    const emailNormalizado = email.trim()
    if (!emailNormalizado || !senha.trim()) throw new Error('Informe e-mail e senha.')

    setApiCredentials(emailNormalizado, senha)
    try {
      const usuarios: Usuario[] = await listarUsuarios()
      const usuario = usuarios.find((item) => item.email.toLowerCase() === emailNormalizado.toLowerCase())
      if (!usuario || !usuario.ativo) throw new Error('E-mail ou senha inválidos.')

      const iniciais = usuario.nome.split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()
      setUser({ id: usuario.id, name: usuario.nome, role: 'OPERADOR', initials: iniciais || 'FF' })
    } catch (error) {
      clearApiCredentials()
      throw error
    }
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
