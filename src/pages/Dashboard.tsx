import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { listarOrdensServicoApi, type OrdemServicoApi } from '../services/ordensServicoApi'
import { listarProdutosApi } from '../services/produtosApi'
import { listarVendasApi, type VendaApi } from '../services/vendasApi'
import { brl, dataBR, hojeISO } from '../services/formatters'
import type { Produto } from '../types'
import styles from './Dashboard.module.css'

const statusOs = (status: OrdemServicoApi['statusOS']) => status ? status.replaceAll('_', ' ') : 'Sem status'

export default function Dashboard() {
  const navigate = useNavigate()
  const [ordens, setOrdens] = useState<OrdemServicoApi[]>([])
  const [vendas, setVendas] = useState<VendaApi[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([listarOrdensServicoApi(), listarVendasApi(), listarProdutosApi()])
      .then(([listaOrdens, listaVendas, listaProdutos]) => {
        setOrdens(listaOrdens)
        setVendas(listaVendas)
        setProdutos(listaProdutos)
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Não foi possível carregar o painel.'))
      .finally(() => setCarregando(false))
  }, [])

  const stats = useMemo(() => {
    const vendasHoje = vendas.filter((venda) => dataBR(venda.dataVenda) === dataBR(hojeISO()))
    const abertas = ordens.filter((ordem) => ordem.statusOS !== 'ENTREGUE' && ordem.statusOS !== 'CANCELADO')
    return [
      { label: 'OS EM ABERTO', value: String(abertas.length), hint: 'Ordens aguardando conclusão' },
      { label: 'PRONTAS PARA RETIRADA', value: String(ordens.filter((ordem) => ordem.statusOS === 'PRONTO').length), hint: 'Ordens prontas para retirada' },
      { label: 'VENDAS HOJE', value: String(vendasHoje.length), hint: 'Vendas registradas no backend' },
      { label: 'VALOR RECEBIDO HOJE', value: brl(vendasHoje.reduce((total, venda) => total + Number(venda.valorPago), 0)), hint: 'Pagamentos registrados hoje' },
      { label: 'PRODUTOS NO CATÁLOGO', value: String(produtos.length), hint: 'Produtos disponíveis no backend' },
      { label: 'UNIDADES EM ESTOQUE', value: String(produtos.reduce((total, produto) => total + produto.estoque, 0)), hint: 'Estoque informado pelo backend' },
    ]
  }, [ordens, vendas, produtos])

  const ordensAbertas = ordens
    .filter((ordem) => ordem.statusOS !== 'ENTREGUE' && ordem.statusOS !== 'CANCELADO')
    .slice(0, 7)

  return (
    <div className={styles.page}>
      {erro && <p role="alert" className={styles.erro}>{erro}</p>}
      <div className={styles.stats}>
        {stats.map((s) => (
          <Card key={s.label} className={styles.stat}>
            <span>{s.label}</span>
            <strong>{carregando ? '—' : s.value}</strong>
            <small>{s.hint}</small>
          </Card>
        ))}
      </div>

      <Card className={styles.table}>
        <header>
          <h2>Ordens de Serviço em Aberto</h2>
          <small>{carregando ? 'Carregando...' : `${ordensAbertas.length} exibida(s)`}</small>
        </header>
        <table>
          <thead>
            <tr><th>Nº OS</th><th>Cliente</th><th>Aparelho</th><th>Status</th><th className={styles.right}>Valor</th></tr>
          </thead>
          <tbody>
            {!carregando && ordensAbertas.map((ordem) => (
              <tr key={ordem.id}>
                <td className="mono">{ordem.id}</td>
                <td>{ordem.nomeCliente || '—'}</td>
                <td className="muted">{ordem.aparelhoMarca} {ordem.aparelhoModelo}</td>
                <td className={styles.status}>{statusOs(ordem.statusOS)}</td>
                <td className={styles.right}><b>{brl(Number(ordem.valorEstimado) || 0)}</b></td>
              </tr>
            ))}
            {carregando && <tr><td colSpan={5}>Carregando ordens de serviço...</td></tr>}
            {!carregando && !erro && ordensAbertas.length === 0 && <tr><td colSpan={5}>Nenhuma ordem de serviço em aberto.</td></tr>}
          </tbody>
        </table>
      </Card>

      <div className={styles.actions}>
        <Button onClick={() => navigate('/ordens-de-servico')}>＋ Nova OS</Button>
        <Button onClick={() => navigate('/vendas')}>＋ Nova Venda</Button>
      </div>
    </div>
  )
}
