import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button, Card } from '../components/ui'
import { criarClienteApi, listarClientesApi } from '../services/clientesApi'
import { dataBR } from '../services/formatters'
import { listarOrdensServicoApi, type OrdemServicoApi } from '../services/ordensServicoApi'
import { listarComprasClienteApi, type CompraHistoricoApi } from '../services/vendasApi'
import type { NovoClienteApi } from '../services/clientesApi'
import type { Cliente } from '../types'
import { NovoClienteModal } from './clientes/NovoClienteModal'
import { HistoricoModal } from './clientes/HistoricoModal'
import styles from './Clientes.module.css'

const iniciais = (nome: string) =>
  nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [ordens, setOrdens] = useState<OrdemServicoApi[]>([])
  const [params] = useSearchParams()
  const [busca, setBusca] = useState(params.get('q') ?? '')
  const [novoAberto, setNovoAberto] = useState(false)
  const [historico, setHistorico] = useState<Cliente | null>(null)
  const [erroApi, setErroApi] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [compras, setCompras] = useState<CompraHistoricoApi[]>([])
  const [carregandoHistorico, setCarregandoHistorico] = useState(false)

  const carregarDados = () => Promise.all([listarClientesApi(), listarOrdensServicoApi()])
    .then(([listaClientes, listaOrdens]) => {
      setClientes(listaClientes)
      setOrdens(listaOrdens)
      setErroApi('')
    })

  const salvarCliente = async (dados: NovoClienteApi) => {
    setErroApi('')
    let clienteCriado = false
    try {
      await criarClienteApi(dados)
      clienteCriado = true
      setNovoAberto(false)
      await carregarDados()
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : 'falha desconhecida'
      setErroApi(clienteCriado ? `Cliente cadastrado, mas a lista não pôde ser atualizada: ${detalhe}` : detalhe)
    }
  }

  useEffect(() => {
    carregarDados()
      .catch((e: unknown) => setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar clientes.'))
      .finally(() => setCarregando(false))
  }, [])

  const abrirHistorico = (cliente: Cliente) => {
    setErroApi('')
    setCompras([])
    setCarregandoHistorico(true)
    setHistorico(cliente)
  }

  useEffect(() => {
    if (!historico) return
    let ativo = true
    listarComprasClienteApi(historico.nome)
      .then((lista) => { if (ativo) setCompras(lista) })
      .catch((e: unknown) => { if (ativo) setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar as compras do cliente.') })
      .finally(() => { if (ativo) setCarregandoHistorico(false) })
    return () => { ativo = false }
  }, [historico])

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const qDigitos = q.replace(/\D/g, '')
    if (!q) return clientes
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (qDigitos && (c.cpf.replace(/\D/g, '').includes(qDigitos) || c.telefone.replace(/\D/g, '').includes(qDigitos))),
    )
  }, [clientes, busca])

  return (
    <>
      <PageHeader
        title="Base de Clientes"
        subtitle={`${clientes.length} clientes cadastrados`}
        action={<Button onClick={() => setNovoAberto(true)}>＋ Novo Cliente</Button>}
      />

      <Card className={styles.search}>
        <input
          placeholder="Buscar por nome, CPF ou telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </Card>

      <Card className={styles.table}>
        {erroApi && <p role="alert" className={styles.empty}>{erroApi}</p>}
        <p className={styles.note}>O backend não disponibiliza rotas de locação; a coluna de aluguéis não contém dados.</p>
        <table>
          <thead>
            <tr>
              <th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th>Cliente desde</th><th>OS</th><th>Aluguéis</th><th />
            </tr>
          </thead>
          <tbody>
            {!carregando && filtrados.map((c) => (
              <tr key={c.id}>
                <td>
                  <span className={styles.nome}>
                    <i>{iniciais(c.nome)}</i>
                    {c.nome}
                  </span>
                </td>
                <td className={styles.cpf}>{c.cpf}</td>
                <td className="muted">{c.telefone}</td>
                <td className={styles.subtle}>{c.email}</td>
                <td className={styles.subtle}>{dataBR(c.desde)}</td>
                <td><b>{ordens.filter((o) => o.nomeCliente === c.nome).length}</b></td>
                <td><b>—</b></td>
                <td className={styles.right}>
                  <button className={styles.link} onClick={() => abrirHistorico(c)}>Ver histórico →</button>
                </td>
              </tr>
            ))}
            {carregando && <tr><td colSpan={8} className={styles.empty}>Carregando clientes...</td></tr>}
            {!carregando && filtrados.length === 0 && (
              <tr><td colSpan={8} className={styles.empty}>Nenhum cliente encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {novoAberto && (
        <NovoClienteModal
          onClose={() => setNovoAberto(false)}
          onSave={(dados) => void salvarCliente(dados)}
          apiError={erroApi}
        />
      )}
      {historico && (
        <HistoricoModal
          cliente={historico}
          ordens={ordens.filter((o) => o.nomeCliente === historico.nome)}
          compras={compras}
          carregandoCompras={carregandoHistorico}
          erroCompras={erroApi}
          locacoesDisponiveis={false}
          onClose={() => setHistorico(null)}
        />
      )}
    </>
  )
}
