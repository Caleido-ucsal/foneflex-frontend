import { apiRequest } from './api'

export type EnderecoApi = {
  id: number
  rua?: string
  numero?: string
  bairro?: string
  cep: string
  complemento?: string
  pontoReferencia?: string
}

export type NovoEnderecoApi = Omit<EnderecoApi, 'id'>

export function criarEnderecoApi(clienteId: number, dados: NovoEnderecoApi) {
  return apiRequest<{ message: string }>(`/clientes/${clienteId}/enderecos`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}
