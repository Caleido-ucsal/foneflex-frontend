import type { Cliente } from '../types'
import { apiRequest } from './api'

export type ClienteApi = {
  id: number
  nome: string
  cpf?: string | null
  telefone: string
  email?: string | null
  dataCadastro: string
}

const mapearCliente = (cliente: ClienteApi): Cliente => ({
  id: String(cliente.id),
  nome: cliente.nome,
  cpf: cliente.cpf ?? '',
  telefone: cliente.telefone,
  email: cliente.email ?? '',
  desde: cliente.dataCadastro.slice(0, 10),
})

export async function listarClientesApi(): Promise<Cliente[]> {
  const clientes = await apiRequest<ClienteApi[]>('/clientes')
  return clientes.map(mapearCliente)
}
