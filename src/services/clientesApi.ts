import type { Cliente } from '../types'
import { apiRequest } from './api'
import { maskCpf, maskTelefone } from './masks'

export type ClienteApi = {
  id: number
  nome: string
  cpf?: string | null
  telefone: string | null
  email?: string | null
  dataCadastro: string | null
}

const mapearCliente = (cliente: ClienteApi): Cliente => ({
  id: String(cliente.id),
  nome: cliente.nome,
  cpf: cliente.cpf ? maskCpf(cliente.cpf) : '',
  telefone: cliente.telefone ? maskTelefone(cliente.telefone) : '',
  email: cliente.email ?? '',
  desde: cliente.dataCadastro?.slice(0, 10) ?? '',
})

export async function listarClientesApi(): Promise<Cliente[]> {
  const clientes = await apiRequest<ClienteApi[]>('/clientes')
  return clientes.map(mapearCliente)
}

export type NovoClienteApi = {
  nome: string
  telefone: string
  cpf?: string
  email?: string
}

export function criarClienteApi(dados: NovoClienteApi) {
  return apiRequest<{ message: string }>('/clientes', {
    method: 'POST',
    body: JSON.stringify({
      nome: dados.nome,
      telefone: dados.telefone.replace(/\D/g, ''),
      ...(dados.cpf?.trim() ? { cpf: dados.cpf.replace(/\D/g, '') } : {}),
      ...(dados.email?.trim() ? { email: dados.email.trim() } : {}),
    }),
  })
}

export function atualizarClienteApi(id: number, dados: NovoClienteApi) {
  return apiRequest<{ mensagem: string }>(`/clientes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirClienteApi(id: number) {
  return apiRequest<{ mensagem: string }>(`/clientes/${id}`, { method: 'DELETE' })
}
