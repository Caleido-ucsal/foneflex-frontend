import { apiRequest } from './api'
import { listarPagamentosVendaApi, registrarPagamentoVendaApi, type BandeiraCartaoApi, type MetodoPagamentoApi } from './pagamentosApi'

export type VendaApi = {
  id: number
  nomeFuncionario: string | null
  nomeCliente: string | null
  dataVenda: string
  status: 'EM_ABERTO' | 'CONCLUIDA' | 'CANCELADA'
  valorVenda: number
  valorPago: number
  ultimaAlteracao: string
}

export type ProdutoVendaApi = {
  id: number
  nomeProduto: string
  quantidade: number
  precoUnitario: number
  subTotal: number
}

export type VendaInput = { clienteId?: number }
export type ProdutoVendaInput = { produtoId: number; quantidade: number }
export type CompraHistoricoApi = {
  id: number
  data: string
  itens: string[]
  pagamento: string
  total: number
}

export class VendaParcialError extends Error {
  readonly vendaId?: number

  constructor(message: string, vendaId?: number) {
    super(message)
    this.name = 'VendaParcialError'
    this.vendaId = vendaId
  }
}

const rotuloPagamento: Record<MetodoPagamentoApi, string> = {
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
}

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

export async function listarComprasClienteApi(nomeCliente: string): Promise<CompraHistoricoApi[]> {
  const vendas = await listarVendasApi()
  const compras = vendas.filter((venda) => venda.nomeCliente === nomeCliente)
  return Promise.all(compras.map(async (venda) => {
    const [itens, pagamentos] = await Promise.all([
      listarProdutosVendaApi(venda.id),
      listarPagamentosVendaApi(venda.id),
    ])
    return {
      id: venda.id,
      data: venda.dataVenda,
      itens: itens.map((item) => `${item.quantidade}x ${item.nomeProduto}`),
      pagamento: pagamentos.map((item) => rotuloPagamento[item.metodoPagamento]).join(', ') || 'Não informado',
      total: Number(venda.valorVenda),
    }
  }))
}

export function atualizarProdutoVendaApi(vendaId: number, id: number, dados: ProdutoVendaInput) {
  return apiRequest<{ message: string }>(`/vendas/${vendaId}/produtos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function removerProdutoVendaApi(vendaId: number, id: number) {
  return apiRequest<{ mensagem: string }>(`/vendas/${vendaId}/produtos/${id}`, { method: 'DELETE' })
}

export async function concluirVendaApi(
  clienteId: number | undefined,
  itens: ProdutoVendaInput[],
  pagamentos: { metodoPagamento: MetodoPagamentoApi; bandeiraCartao?: BandeiraCartaoApi; valor: number }[],
) {
  const anteriores = await listarVendasApi()
  await registrarVendaApi(clienteId === undefined ? {} : { clienteId })
  let atuais: VendaApi[]
  try {
    atuais = await listarVendasApi()
  } catch (error) {
    const detalhe = error instanceof Error ? `: ${error.message}` : ''
    throw new VendaParcialError(`A venda foi registrada, mas não foi possível recuperar seu ID${detalhe}. Consulte as vendas antes de tentar novamente.`)
  }
  const idsAnteriores = new Set(anteriores.map((venda) => venda.id))
  const novas = atuais.filter((venda) => !idsAnteriores.has(venda.id))
  if (novas.length !== 1) {
    throw new VendaParcialError('A venda foi registrada, mas não foi possível identificar seu ID para lançar os produtos. Consulte as vendas antes de tentar novamente.')
  }

  const vendaId = novas[0].id
  try {
    for (const item of itens) {
      await adicionarProdutoVendaApi(vendaId, item)
    }
    for (const pagamento of pagamentos) {
      if (pagamento.valor > 0) await registrarPagamentoVendaApi(vendaId, pagamento)
    }
  } catch (error) {
    const detalhe = error instanceof Error ? error.message : 'erro desconhecido'
    throw new VendaParcialError(`Venda ${vendaId} criada, mas a inclusão dos itens ou do pagamento falhou: ${detalhe}. Verifique a venda antes de tentar novamente.`, vendaId)
  }
  return vendaId
}
