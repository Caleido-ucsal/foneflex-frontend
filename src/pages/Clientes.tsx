import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Button, Card } from '../components/ui'
import { listarOrdens } from '../services/ordens'
import { criarClienteApi, listarClientesApi } from '../services/clientesApi'
import type { NovoCliente } from '../services/clientes'
import { listarLocacoes } from '../services/locacoes'
import { dataBR } from '../services/mock'
import { listarVendas } from '../services/vendas'
import type { Cliente } from '../types'
import { NovoClienteModal } from './clientes/NovoClienteModal'
import { HistoricoModal } from './clientes/HistoricoModal'
import styles from './Clientes.module.css'

const iniciais = (nome: string) =>
  nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [params] = useSearchParams()
  const [busca, setBusca] = useState(params.get('q') ?? '')
  const [novoAberto, setNovoAberto] = useState(false)
  const [historico, setHistorico] = useState<Cliente | null>(null)
  const [erroApi, setErroApi] = useState('')

  const salvarCliente = async (dados: NovoCliente) => {
    try {
      await criarClienteApi(dados)
      setNovoAberto(false)
      setErroApi('')
      setClientes(await listarClientesApi())
    } catch (e) {
      setErroApi(e instanceof Error ? e.message : 'Não foi possível cadastrar cliente.')
    }
  }

  useEffect(() => {
    listarClientesApi().then(setClientes).catch((e: unknown) => {
      setErroApi(e instanceof Error ? e.message : 'Não foi possível carregar clientes.')
    })
  }, [])

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
        <table>
          <thead>
            <tr>
              <th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th><th>Cliente desde</th><th>OS</th><th>Aluguéis</th><th />
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c) => (
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
                <td><b>{listarOrdens().filter((o) => o.clienteId === c.id).length}</b></td>
                <td><b>{listarLocacoes().filter((l) => l.clienteId === c.id).length}</b></td>
                <td className={styles.right}>
                  <button className={styles.link} onClick={() => setHistorico(c)}>Ver histórico →</button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
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
          ordens={listarOrdens().filter((o) => o.clienteId === historico.id)}
          compras={listarVendas().filter((v) => v.clienteId === historico.id)}
          locacoes={listarLocacoes().filter((l) => l.clienteId === historico.id)}
          onClose={() => setHistorico(null)}
        />
      )}
    </>
  )
}
