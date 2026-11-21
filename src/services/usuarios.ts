import { apiRequest } from './api'

export type NovoUsuario = {
  nome: string
  email: string
  senha: string
  ativo?: boolean
}

type RespostaCriarUsuario = { message: string }

export function criarUsuario(dados: NovoUsuario) {
  return apiRequest<RespostaCriarUsuario>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}
