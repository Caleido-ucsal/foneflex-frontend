import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button, Card, FilterTabs } from '../components/ui'
import { criarClienteApi, listarClientesApi } from '../services/clientesApi'
import { brl, dataBR } from '../services/mock'
import { criarOrdemServicoApi, listarOrdensServicoApi, type OrdemServicoApi, type StatusOsApi } from '../services/ordensServicoApi'
import type { Cliente } from '../types'
import { NovaOSModal, type NovaOSForm } from './ordens/NovaOSModal'
import styles from './OrdensServico.module.css'

const STATUS: Record<StatusOsApi, string> = {
  EM_ANALISE: 'Em Análise',
  EM_ANDAMENTO: 'Em Andamento',
  AGUARDANDO_PECA: 'Aguardando Peça',
  PRONTO: 'Pronto para Retirada',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}
const FILTROS = ['Todos', ...Object.values(STATUS)]
const classeStatus = (s: string) => s === 'Entregue' ? styles.neutro : s === 'Cancelado' ? styles.apagado : styles.ativo
const dataCurta = (data: string) => dataBR(data.slice(0, 10))

export default function OrdensServico() {
  const [ordens, setOrdens] = useState<OrdemServicoApi[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState('Todos')
  const [params] = useSearchParams()
  const [busca, setBusca] = useState(params.get('q') ?? '')
  const [modal, setModal] = useState(false)
  const [erroApi, setErroApi] = useState('')

  useEffect(() => {
    Promise.all([listarOrdensServicoApi(), listarClientesApi()])
      .then(([listaOrdens, listaClientes]) => {
        setOrdens(listaOrdens)
        setClientes(listaClientes)
      })
      .catch((e: unknown) => setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar as ordens.'))
  }, [])

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return ordens.filter((o) => {
      if (filtro !== 'Todos' && STATUS[o.statusOS] !== filtro) return false
      return !q || [String(o.id), o.aparelhoMarca, o.aparelhoModelo, o.nomeCliente].some((v) => v.toLowerCase().includes(q))
    })
  }, [ordens, filtro, busca])

  const salvarOrdem = async (dados: NovaOSForm) => {
    setErroApi('')
    try {
      let listaClientes = clientes
      let cliente = listaClientes.find((c) => c.cpf.replace(/\D/g, '') === dados.cpf)
      if (!cliente) {
        await criarClienteApi({ nome: dados.nome, cpf: dados.cpf, telefone: dados.telefone })
        listaClientes = await listarClientesApi()
        setClientes(listaClientes)
        cliente = listaClientes.find((c) => c.cpf.replace(/\D/g, '') === dados.cpf)
      }
      if (!cliente) throw new Error('O cliente foi salvo, mas não apareceu na listagem da API.')

      await criarOrdemServicoApi({
        aparelhoModelo: dados.aparelhoModelo,
        aparelhoMarca: dados.aparelhoMarca,
        numeroSerieImei: dados.numeroSerieImei,
        descricaoProblema: dados.descricaoProblema,
        valorEstimado: dados.valorEstimado,
        clienteId: Number(cliente.id),
        statusOs: 'EM_ANALISE',
      })
      setModal(false)
      setErroApi('')
      try {
        setOrdens(await listarOrdensServicoApi())
      } catch (e) {
        setErroApi(e instanceof Error ? `OS cadastrada, mas não foi possível atualizar a lista: ${e.message}` : 'OS cadastrada, mas não foi possível atualizar a lista.')
      }
    } catch (e) {
      setErroApi(e instanceof Error ? e.message : 'Não foi possível criar a ordem de serviço.')
    }
  }

  const abertas = ordens.filter((o) => o.statusOS !== 'ENTREGUE' && o.statusOS !== 'CANCELADO').length

  return (
    <>
      <PageHeader
        title="Ordens de Serviço"
        subtitle={`${abertas} abertas · ${ordens.length} total`}
        action={<Button onClick={() => { setErroApi(''); setModal(true) }}>＋ Nova OS</Button>}
      />

      <Card className={styles.filtros}>
        <FilterTabs options={FILTROS} value={filtro} onChange={setFiltro} />
        <input placeholder="Buscar OS, cliente, aparelho..." value={busca} onChange={(e) => setBusca(e.target.value)} />
      </Card>

      {erroApi && <p role="alert" className={styles.empty}>{erroApi}</p>}
      <Card className={styles.table}>
        <table>
          <thead>
            <tr><th>Nº OS</th><th>Data</th><th>Cliente</th><th>Aparelho</th><th>Técnico</th><th>Status</th><th className={styles.right}>Valor total</th><th className={styles.right}>Ações</th></tr>
          </thead>
          <tbody>
            {visiveis.map((o) => {
              const status = STATUS[o.statusOS]
              return (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td className={styles.subtle}>{dataCurta(o.dataAbertura)}</td>
                  <td><b>{o.nomeCliente}</b></td>
                  <td>{o.aparelhoMarca} {o.aparelhoModelo}</td>
                  <td className="muted">{o.nomeFuncionarioResponsavel || '—'}</td>
                  <td className={classeStatus(status)}>{status}</td>
                  <td className={styles.right}><b>{brl(Number(o.valorEstimado) || 0)}</b></td>
                  <td className={styles.right}>—</td>
                </tr>
              )
            })}
            {visiveis.length === 0 && <tr><td colSpan={8} className={styles.empty}>Nenhuma ordem de serviço encontrada.</td></tr>}
          </tbody>
        </table>
      </Card>

      {modal && <NovaOSModal onClose={() => setModal(false)} onSave={salvarOrdem} clientes={clientes} apiError={erroApi} />}
    </>
  )
}
