import { apiRequest } from './api'

export type StatusOsApi = 'EM_ANALISE' | 'EM_ANDAMENTO' | 'AGUARDANDO_PECA' | 'PRONTO' | 'ENTREGUE' | 'CANCELADO'

export type OrdemServicoApi = {
  id: number
  aparelhoModelo: string
  aparelhoMarca: string
  numeroSerieImei: string
  descricaoProblema: string
  valorEstimado: string | number
  nomeCliente: string
  nomeFuncionarioResponsavel?: string | null
  statusOS: StatusOsApi
  dataAbertura: string
  dataConclusao?: string | null
}

export type OrdemServicoInput = {
  aparelhoModelo: string
  aparelhoMarca: string
  numeroSerieImei: string
  descricaoProblema: string
  valorEstimado: number
  clienteId: number
  funcionarioResponsavelId?: number | null
  statusOs?: StatusOsApi
  dataConclusao?: string
}

export function criarOrdemServicoApi(dados: OrdemServicoInput) {
  return apiRequest<{ message: string }>('/ordens-servico', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}

export function listarOrdensServicoApi() {
  return apiRequest<OrdemServicoApi[]>('/ordens-servico')
}

export function obterOrdemServicoApi(id: number) {
  return apiRequest<OrdemServicoApi>(`/ordens-servico/${id}`)
}

export function atualizarOrdemServicoApi(id: number, dados: OrdemServicoInput) {
  return apiRequest<{ message: string }>(`/ordens-servico/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}
