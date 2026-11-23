import { useState } from 'react'
import { Modal } from '../../components/ui'
import { brl, dataBR } from '../../services/formatters'
import type { OrdemServicoApi } from '../../services/ordensServicoApi'
import type { CompraHistoricoApi } from '../../services/vendasApi'
import type { Cliente } from '../../types'
import styles from './HistoricoModal.module.css'

type Props = {
  cliente: Cliente
  ordens: OrdemServicoApi[]
  compras: CompraHistoricoApi[]
  carregandoCompras: boolean
  erroCompras: string
  locacoesDisponiveis: boolean
  onClose: () => void
}
type Aba = 'os' | 'compras' | 'alugueis'

const rotuloStatusOs: Record<Exclude<OrdemServicoApi['statusOS'], null>, string> = {
  EM_ANALISE: 'Em Análise',
  EM_ANDAMENTO: 'Em Andamento',
  AGUARDANDO_PECA: 'Aguardando Peça',
  PRONTO: 'Pronto para Retirada',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

export function HistoricoModal({ cliente, ordens, compras, carregandoCompras, erroCompras, locacoesDisponiveis, onClose }: Props) {
  const [aba, setAba] = useState<Aba>('os')
  const abas: { id: Aba; label: string; n: number | string }[] = [
    { id: 'os', label: 'Ordens de Serviço', n: ordens.length },
    { id: 'compras', label: 'Compras', n: carregandoCompras ? '…' : compras.length },
    { id: 'alugueis', label: 'Aluguéis', n: locacoesDisponiveis ? 0 : '—' },
  ]

  return (
    <Modal title="Histórico do Cliente" onClose={onClose} width={795}>
      <div className={styles.resumo}>
        <div className={styles.avatar}>👤</div>
        <div className={styles.info}>
          <strong>{cliente.nome}</strong>
          <span>{cliente.cpf} &nbsp; {cliente.telefone} &nbsp; {cliente.email}</span>
        </div>
        <div className={styles.kpi}><b>{ordens.length}</b><small>OS Total</small></div>
        <div className={styles.kpi}><b>{locacoesDisponiveis ? '0' : '—'}</b><small>Aluguéis</small></div>
      </div>

      <div className={styles.tabs} role="tablist">
        {abas.map((a) => (
          <button key={a.id} role="tab" aria-selected={aba === a.id} className={aba === a.id ? styles.on : ''} onClick={() => setAba(a.id)}>
            {a.label} <span>{a.n}</span>
          </button>
        ))}
      </div>

      {aba === 'os' && (
        <Tabela
          cols={['Nº OS', 'Data', 'Aparelho', 'Defeito', 'Status', 'Valor']}
          rows={ordens.map((o) => [<span key="id" className="mono">{o.id}</span>, dataBR(o.dataAbertura), `${o.aparelhoMarca} ${o.aparelhoModelo}`, o.descricaoProblema, <b key="s">{o.statusOS ? rotuloStatusOs[o.statusOS] : 'Sem status'}</b>, brl(Number(o.valorEstimado))])}
        />
      )}
      {aba === 'compras' && (
        <>
          {erroCompras && <p role="alert" className={styles.vazio}>{erroCompras}</p>}
          {carregandoCompras
            ? <p className={styles.vazio}>Carregando compras...</p>
            : <Tabela
                cols={['Nº', 'Data', 'Itens', 'Pagamento', 'Valor']}
                rows={compras.map((c) => [<span key="id" className="mono">{c.id}</span>, dataBR(c.data), c.itens.join(', ') || 'Sem itens', c.pagamento, brl(c.total)])}
              />}
        </>
      )}
      {aba === 'alugueis' && (
        <p className={styles.vazio}>
          {locacoesDisponiveis ? 'Nenhum registro.' : 'O backend atual não disponibiliza endpoints de locação.'}
        </p>
      )}
    </Modal>
  )
}

function Tabela({ cols, rows }: { cols: string[]; rows: React.ReactNode[][] }) {
  if (rows.length === 0) return <p className={styles.vazio}>Nenhum registro.</p>
  return (
    <table className={styles.table}>
      <thead><tr>{cols.map((c) => <th key={c}>{c}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  )
}
