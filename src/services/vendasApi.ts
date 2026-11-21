import { apiRequest } from './api'

export type VendaApi = {
  id: number
  nomeFuncionario: string
  nomeCliente: string
  dataVenda: string
  status: 'EM_ABERTO' | 'CONCLUIDA' | 'CANCELADA'
  valorVenda: number
  ultimaAlteracao: string
}

export type ProdutoVendaApi = {
  id: number
  nomeProduto: string
  quantidade: number
  precoUnitario: number
  subTotal: number
}

export type VendaInput = { clienteId: number }
export type ProdutoVendaInput = { vendaId: number; produtoId: number; quantidade: number }

export function registrarVendaApi(dados: VendaInput) {
  return apiRequest<{ message: string }>('/vendas', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function listarVendasApi() {
  return apiRequest<VendaApi[]>('/vendas')
}
