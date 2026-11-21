import { apiRequest } from './api'

export type NovoUsuario = {
  nome: string
  email: string
  senha: string
  ativo?: boolean
}

type RespostaCriarUsuario = { message: string }

export type Usuario = {
  id: number
  nome: string
  email: string
  ativo: boolean
  dataInclusao: string
}

export function listarUsuarios() {
  return apiRequest<Usuario[]>('/usuarios')
}

export function atualizarUsuario(id: number, dados: NovoUsuario) {
  return apiRequest<{ mensagem: string }>(`/usuarios/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dados),
  })
}

export function excluirUsuario(id: number) {
  return apiRequest<{ mensagem: string }>(`/usuarios/${id}`, { method: 'DELETE' })
}

export function criarUsuario(dados: NovoUsuario) {
  return apiRequest<RespostaCriarUsuario>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(dados),
  })
}
