import { apiRequest } from './api'
import type { FormaPagamento } from '../types'

export type MetodoPagamentoApi = 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'DINHEIRO'
export type BandeiraCartaoApi = 'VISA' | 'MASTERCARD' | 'ELO' | 'AMERICAN_EXPRESS' | 'HIPERCARD'
export const BANDEIRAS_CARTAO: { value: BandeiraCartaoApi; label: string }[] = [
  { value: 'VISA', label: 'Visa' },
  { value: 'MASTERCARD', label: 'Mastercard' },
  { value: 'ELO', label: 'Elo' },
  { value: 'AMERICAN_EXPRESS', label: 'American Express' },
  { value: 'HIPERCARD', label: 'Hipercard' },
]
export const FORMAS_PAGAMENTO: FormaPagamento[] = ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']

export type PagamentoApi = {
  id: number
  nomeFuncionario: string | null
  dataPagamento: string
  vendaId: number | null
  ordemServicoId: number | null
  metodoPagamento: MetodoPagamentoApi
  bandeiraCartao: BandeiraCartaoApi | null
  valor: number
}

export type PagamentoInput = {
  metodoPagamento: MetodoPagamentoApi
  bandeiraCartao?: BandeiraCartaoApi
  valor: number
}

export function registrarPagamentoVendaApi(vendaId: number, dados: PagamentoInput) {
  return apiRequest<{ message: string }>(`/vendas/${vendaId}/pagamentos`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function listarPagamentosVendaApi(vendaId: number) {
  return apiRequest<PagamentoApi[]>(`/vendas/${vendaId}/pagamentos`)
}

export function registrarPagamentoOrdemServicoApi(ordemServicoId: number, dados: PagamentoInput) {
  return apiRequest<{ message: string }>(`/ordens-servico/${ordemServicoId}/pagamentos`, {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function listarPagamentosOrdemServicoApi(ordemServicoId: number) {
  return apiRequest<PagamentoApi[]>(`/ordens-servico/${ordemServicoId}/pagamentos`)
}
