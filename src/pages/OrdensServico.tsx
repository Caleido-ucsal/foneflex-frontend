import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button, Card, FilterTabs } from '../components/ui'
import { useAuth } from '../services/auth'
import { criarClienteApi, listarClientesApi } from '../services/clientesApi'
import { brl, dataBR } from '../services/formatters'
import { atualizarOrdemServicoApi, criarOrdemServicoApi, listarOrdensServicoApi, type OrdemServicoApi, type StatusOsApi } from '../services/ordensServicoApi'
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
const agoraIsoLocal = () => {
  const agora = new Date()
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0')
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}T${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}:${doisDigitos(agora.getSeconds())}`
}

export default function OrdensServico() {
  const { user } = useAuth()
  const [ordens, setOrdens] = useState<OrdemServicoApi[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState('Todos')
  const [params] = useSearchParams()
  const [busca, setBusca] = useState(params.get('q') ?? '')
  const [modal, setModal] = useState(false)
  const [erroApi, setErroApi] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([listarOrdensServicoApi(), listarClientesApi()])
      .then(([listaOrdens, listaClientes]) => {
        setOrdens(listaOrdens)
        setClientes(listaClientes)
      })
      .catch((e: unknown) => setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar as ordens.'))
      .finally(() => setCarregando(false))
  }, [])

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return ordens.filter((o) => {
      if (filtro !== 'Todos' && STATUS[o.statusOS ?? 'EM_ANALISE'] !== filtro) return false
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
        try {
          listaClientes = await listarClientesApi()
        } catch (e) {
          const detalhe = e instanceof Error ? `: ${e.message}` : ''
          throw new Error(`Cliente cadastrado, mas não foi possível recuperar seu ID para criar a OS${detalhe}. Atualize a tela antes de tentar novamente.`)
        }
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
        funcionarioResponsavelId: user?.id,
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

  const atualizarStatus = async (ordem: OrdemServicoApi, statusOs: StatusOsApi) => {
    const clientesDaOrdem = clientes.filter((item) => item.nome === ordem.nomeCliente)
    if (clientesDaOrdem.length !== 1) {
      setErroApi('Não foi possível atualizar o status com segurança: o backend não retorna o ID do cliente da OS e o nome não identifica um único cliente.')
      return
    }
    const cliente = clientesDaOrdem[0]

    setAtualizandoId(ordem.id)
    setErroApi('')
    try {
      await atualizarOrdemServicoApi(ordem.id, {
        aparelhoModelo: ordem.aparelhoModelo,
        aparelhoMarca: ordem.aparelhoMarca,
        numeroSerieImei: ordem.numeroSerieImei,
        descricaoProblema: ordem.descricaoProblema,
        valorEstimado: Number(ordem.valorEstimado),
        clienteId: Number(cliente.id),
        statusOs,
        ...(statusOs === 'ENTREGUE' ? { dataConclusao: agoraIsoLocal() } : {}),
      })
      setOrdens(await listarOrdensServicoApi())
    } catch (e) {
      setErroApi(e instanceof Error ? e.message : 'Não foi possível atualizar o status da ordem.')
    } finally {
      setAtualizandoId(null)
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
              const status = o.statusOS ? STATUS[o.statusOS] : 'Sem status'
              return (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td className={styles.subtle}>{dataCurta(o.dataAbertura)}</td>
                  <td><b>{o.nomeCliente}</b></td>
                  <td>{o.aparelhoMarca} {o.aparelhoModelo}</td>
                  <td className="muted">{o.nomeFuncionarioResponsavel || '—'}</td>
                  <td className={classeStatus(status)}>{status}</td>
                  <td className={styles.right}><b>{brl(Number(o.valorEstimado) || 0)}</b></td>
                  <td className={styles.right}>
                    <select
                      aria-label={`Alterar status da OS ${o.id}`}
                      value={o.statusOS ?? 'EM_ANALISE'}
                      disabled={atualizandoId === o.id || clientes.filter((cliente) => cliente.nome === o.nomeCliente).length !== 1}
                      title={clientes.filter((cliente) => cliente.nome === o.nomeCliente).length !== 1 ? 'A API não informa o ID do cliente desta OS para atualizar com segurança.' : undefined}
                      onChange={(event) => void atualizarStatus(o, event.target.value as StatusOsApi)}
                    >
                      {Object.entries(STATUS).map(([valor, rotulo]) => <option key={valor} value={valor}>{rotulo}</option>)}
                    </select>
                  </td>
                </tr>
              )
            })}
            {carregando && <tr><td colSpan={8} className={styles.empty}>Carregando ordens de serviço...</td></tr>}
            {!carregando && visiveis.length === 0 && <tr><td colSpan={8} className={styles.empty}>Nenhuma ordem de serviço encontrada.</td></tr>}
          </tbody>
        </table>
      </Card>

      {modal && <NovaOSModal onClose={() => setModal(false)} onSave={salvarOrdem} clientes={clientes} apiError={erroApi} />}
    </>
  )
}
