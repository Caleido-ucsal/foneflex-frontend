import type { Cliente, Locacao, OrdemServico, Produto } from '../types'

export const clientesSeed: Cliente[] = [
  { id: 'c1', nome: 'João Pereira', cpf: '123.456.789-00', telefone: '(11) 98765-4321', email: 'joao.pereira@email.com', desde: '2025-03-13' },
  { id: 'c2', nome: 'Maria Lima', cpf: '234.567.890-11', telefone: '(11) 97654-3210', email: 'maria.lima@email.com', desde: '2025-05-21' },
  { id: 'c3', nome: 'Carlos Souza', cpf: '345.678.901-22', telefone: '(21) 96543-2109', email: 'carlos.souza@email.com', desde: '2025-07-07' },
  { id: 'c4', nome: 'Ana Rodrigues', cpf: '456.789.012-33', telefone: '(31) 95432-1098', email: 'ana.rodrigues@email.com', desde: '2025-07-31' },
  { id: 'c5', nome: 'Roberto Ferreira', cpf: '567.890.123-44', telefone: '(11) 94321-0987', email: 'roberto.ferreira@email.com', desde: '2025-09-10' },
  { id: 'c6', nome: 'Fernanda Costa', cpf: '678.901.234-55', telefone: '(21) 93210-9876', email: 'fernanda.costa@email.com', desde: '2025-11-29' },
  { id: 'c7', nome: 'Lucas Martins', cpf: '789.012.345-66', telefone: '(11) 92109-8765', email: 'lucas.martins@email.com', desde: '2026-01-04' },
  { id: 'c8', nome: 'Beatriz Oliveira', cpf: '890.123.456-77', telefone: '(11) 91098-7654', email: 'beatriz.oliveira@email.com', desde: '2026-04-17' },
]

export const ordensSeed: OrdemServico[] = [
  { id: 'OS-0042', data: '2026-09-15', clienteId: 'c1', aparelho: 'Samsung Galaxy A54', defeito: 'Tela quebrada após queda', tecnico: 'Diego Alves', status: 'Em Análise', valor: 400 },
  { id: 'OS-0041', data: '2026-09-14', clienteId: 'c2', aparelho: 'Apple iPhone 13', defeito: 'Bateria não carrega', tecnico: 'Diego Alves', status: 'Aguardando Peça', valor: 260 },
  { id: 'OS-0040', data: '2026-09-12', clienteId: 'c3', aparelho: 'Motorola Moto G84', defeito: 'Conector de carga solto', tecnico: 'Priscila Ramos', status: 'Pronto para Retirada', valor: 135 },
  { id: 'OS-0039', data: '2026-09-13', clienteId: 'c4', aparelho: 'Xiaomi Redmi Note 12', defeito: 'Sem áudio nas ligações', tecnico: 'Priscila Ramos', status: 'Em Análise', valor: 215 },
  { id: 'OS-0038', data: '2026-09-11', clienteId: 'c5', aparelho: 'Apple iPhone 12', defeito: 'Tela com manchas', tecnico: 'Diego Alves', status: 'Pronto para Retirada', valor: 260 },
  { id: 'OS-0037', data: '2026-09-10', clienteId: 'c6', aparelho: 'Samsung Galaxy S23', defeito: 'Vidro traseiro trincado', tecnico: 'Priscila Ramos', status: 'Aguardando Peça', valor: 580 },
  { id: 'OS-0036', data: '2026-09-09', clienteId: 'c7', aparelho: 'Motorola Edge 40', defeito: 'Não liga', tecnico: 'Diego Alves', status: 'Pronto para Retirada', valor: 140 },
  { id: 'OS-0035', data: '2026-09-08', clienteId: 'c8', aparelho: 'Apple iPhone 14', defeito: 'Face ID não funciona', tecnico: 'Priscila Ramos', status: 'Em Análise', valor: 510 },
  { id: 'OS-0034', data: '2026-09-04', clienteId: 'c1', aparelho: 'Samsung Galaxy A34', defeito: 'Câmera traseira não abre', tecnico: 'Diego Alves', status: 'Entregue', valor: 0 },
  { id: 'OS-0033', data: '2026-09-02', clienteId: 'c3', aparelho: 'Xiaomi POCO X5', defeito: 'Touch sem resposta', tecnico: 'Priscila Ramos', status: 'Cancelado', valor: 0 },
]

export { brl, dataBR } from './formatters'

export const hojeISO = () => new Date().toISOString().slice(0, 10)

export const somarDias = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

export const diasEntre = (de: string, ate: string) =>
  Math.round((new Date(`${ate}T12:00:00`).getTime() - new Date(`${de}T12:00:00`).getTime()) / 86400000)

/* Datas relativas a hoje, para a demonstração sempre mostrar atrasos e prazos coerentes. */
export const locacoesSeed = (): Locacao[] => {
  const h = hojeISO()
  return [
    { id: 'LOC-011', clienteId: 'c1', aparelho: 'iPhone 14 Pro', imei: '352781040000000', inicio: somarDias(h, -11), limite: somarDias(h, -5), valorDia: 50, caucao: 1500, pagamentoCaucao: 'PIX' },
    { id: 'LOC-012', clienteId: 'c2', aparelho: 'Samsung Galaxy S23 Ultra', imei: '490215870000000', inicio: somarDias(h, -6), limite: somarDias(h, 0), valorDia: 60, caucao: 2000, pagamentoCaucao: 'Cartão de Crédito' },
    { id: 'LOC-010', clienteId: 'c3', aparelho: 'iPhone 13', imei: '354102160000000', inicio: somarDias(h, -14), limite: somarDias(h, -7), valorDia: 45, caucao: 1200, pagamentoCaucao: 'PIX' },
    { id: 'LOC-013', clienteId: 'c4', aparelho: 'Motorola Edge 40', imei: '867340210000000', inicio: somarDias(h, -2), limite: somarDias(h, 5), valorDia: 35, caucao: 800, pagamentoCaucao: 'Dinheiro' },
    { id: 'LOC-009', clienteId: 'c5', aparelho: 'iPhone 12', imei: '352398510000000', inicio: somarDias(h, -15), limite: somarDias(h, -9), valorDia: 40, caucao: 1000, pagamentoCaucao: 'PIX', devolvidoEm: somarDias(h, -9), condicao: 'Sem avarias.' },
  ]
}

export const aparelhosAluguel = [
  { nome: 'iPhone 12', valorDia: 40, caucao: 1000 },
  { nome: 'Samsung Galaxy A54', valorDia: 30, caucao: 700 },
  { nome: 'Xiaomi Redmi Note 13', valorDia: 25, caucao: 500 },
]

export const produtosSeed: Produto[] = [
  { id: 'p1', nome: 'iPhone 14 128GB', categoria: 'Smartphones', preco: 3499, estoque: 1 },
  { id: 'p2', nome: 'iPhone 13 128GB', categoria: 'Smartphones', preco: 2899, estoque: 5 },
  { id: 'p3', nome: 'Samsung Galaxy S24', categoria: 'Smartphones', preco: 4199, estoque: 2 },
  { id: 'p4', nome: 'Samsung Galaxy A54', categoria: 'Smartphones', preco: 1899, estoque: 8 },
  { id: 'p5', nome: 'Motorola Edge 40', categoria: 'Smartphones', preco: 1799, estoque: 4 },
  { id: 'p6', nome: 'Xiaomi Redmi Note 13', categoria: 'Smartphones', preco: 1299, estoque: 6 },
  { id: 'p7', nome: 'Capinha Silicone iPhone 14', categoria: 'Acessórios', preco: 49.9, estoque: 22 },
  { id: 'p8', nome: 'Cabo USB-C Turbo 2m', categoria: 'Acessórios', preco: 39.9, estoque: 40 },
  { id: 'p9', nome: 'Carregador 65W GaN', categoria: 'Acessórios', preco: 89.9, estoque: 15 },
  { id: 'p10', nome: 'Película Vidro Temperado', categoria: 'Acessórios', preco: 24.9, estoque: 35 },
  { id: 'p11', nome: 'Fone Bluetooth JBL T510', categoria: 'Acessórios', preco: 149.9, estoque: 7 },
]
