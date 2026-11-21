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

export function obterVendaApi(id: number) {
  return apiRequest<VendaApi>(`/vendas/${id}`)
}

export function buscarVendasApi(pesquisa: string) {
  const query = new URLSearchParams({ pesquisa })
  return apiRequest<VendaApi[]>(`/vendas/buscar?${query}`)
}

export function atualizarVendaApi(id: number, dados: VendaInput) {
  return apiRequest<{ message: string }>(`/vendas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirVendaApi(id: number) {
  return apiRequest<{ message: string }>(`/vendas/${id}`, { method: 'DELETE' })
}

export function adicionarProdutoVendaApi(vendaId: number, dados: ProdutoVendaInput) {
  return apiRequest<{ message: string }>(`/vendas/${vendaId}/produtos`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function listarProdutosVendaApi(vendaId: number) {
  return apiRequest<ProdutoVendaApi[]>(`/vendas/${vendaId}/produtos`)
}
