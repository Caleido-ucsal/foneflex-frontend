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
