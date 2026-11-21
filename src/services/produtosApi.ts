import type { Produto } from '../types'
import { apiRequest } from './api'

export type ProdutoApi = {
  id: number
  nomeProduto: string
  marcaProduto: string
  precoUnitario: number
  descricaoProduto?: string
  condicaoProduto?: string
  quantidadeEstoque?: number
  dataRecebimento?: string
}

export type ProdutoInput = Omit<ProdutoApi, 'id' | 'dataRecebimento'>

const mapearProduto = (p: ProdutoApi): Produto => ({
  id: String(p.id),
  nome: p.nomeProduto,
  categoria: /capa|cabo|carregador|pel[ií]cula|fone|acess[oó]rio/i.test(`${p.nomeProduto} ${p.descricaoProduto ?? ''}`) ? 'Acessórios' : 'Smartphones',
  preco: Number(p.precoUnitario),
  estoque: p.quantidadeEstoque ?? 0,
})

export async function listarProdutosApi(): Promise<Produto[]> {
  return (await apiRequest<ProdutoApi[]>('/produtos')).map(mapearProduto)
}

export async function obterProdutoApi(id: number): Promise<Produto> {
  return mapearProduto(await apiRequest<ProdutoApi>(`/produtos/${id}`))
}

export async function buscarProdutosApi(pesquisa: string): Promise<Produto[]> {
  const query = new URLSearchParams({ pesquisa })
  return (await apiRequest<ProdutoApi[]>(`/produtos/buscar?${query}`)).map(mapearProduto)
}

export function criarProdutoApi(dados: ProdutoInput) {
  return apiRequest<{ message: string }>('/produtos', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function atualizarProdutoApi(id: number, dados: ProdutoInput) {
  return apiRequest<{ message: string }>(`/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}
