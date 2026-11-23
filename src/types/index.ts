export type Cliente = {
  id: string
  nome: string
  cpf: string
  telefone: string
  email: string
  desde: string // ISO yyyy-mm-dd
}

export type OsStatus = 'Em Análise' | 'Aguardando Peça' | 'Pronto para Retirada' | 'Entregue' | 'Cancelado'

export type OrdemServico = {
  id: string
  data: string
  clienteId: string
  aparelho: string
  defeito: string
  tecnico: string
  status: OsStatus
  valor: number
}

export type Locacao = {
  id: string
  clienteId: string
  aparelho: string
  imei: string
  inicio: string
  limite: string
  valorDia: number
  caucao: number
  pagamentoCaucao: FormaPagamento
  devolvidoEm?: string
  condicao?: string
}

export type StatusLocacao = 'Ativo' | 'Atrasado' | 'Devolvido'

export type FormaPagamento = 'PIX' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'

export type Produto = { id: string; nome: string; categoria: 'Smartphones' | 'Acessórios'; preco: number; estoque: number }

export type ItemVenda = { produtoId: string; nome: string; preco: number; qtd: number }

export type Venda = { id: string; data: string; clienteId?: string; itens: ItemVenda[]; total: number; pagamento: string }
