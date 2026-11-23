import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarClientesApi } from '../../services/clientesApi'
import { listarOrdensServicoApi } from '../../services/ordensServicoApi'
import styles from './BuscaGlobal.module.css'

type Resultado = { chave: string; titulo: string; detalhe: string; destino: string }

export function BuscaGlobal() {
  const [q, setQ] = useState('')
  const [aberto, setAberto] = useState(false)
  const [resultados, setResultados] = useState<Resultado[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const termo = q.trim().toLowerCase()
    if (termo.length < 2) return

    let ativo = true
    const timer = window.setTimeout(() => {
      Promise.all([listarClientesApi(), listarOrdensServicoApi()])
        .then(([clientes, ordens]) => {
          if (!ativo) return
          const digitos = termo.replace(/\D/g, '')
          const clientesEncontrados = clientes.filter((cliente) =>
            cliente.nome.toLowerCase().includes(termo) ||
            (digitos && (cliente.cpf.replace(/\D/g, '').includes(digitos) || cliente.telefone.replace(/\D/g, '').includes(digitos))),
          )
          const ordensEncontradas = ordens.filter((ordem) =>
            String(ordem.id).includes(termo) ||
            `${ordem.aparelhoMarca} ${ordem.aparelhoModelo}`.toLowerCase().includes(termo) ||
            ordem.nomeCliente.toLowerCase().includes(termo),
          )
          setResultados([
            ...clientesEncontrados.slice(0, 4).map((cliente) => ({
              chave: `cliente-${cliente.id}`,
              titulo: cliente.nome,
              detalhe: `Cliente · ${cliente.cpf}`,
              destino: `/clientes?q=${encodeURIComponent(cliente.nome)}`,
            })),
            ...ordensEncontradas.slice(0, 4).map((ordem) => ({
              chave: `os-${ordem.id}`,
              titulo: `${ordem.id} · ${ordem.aparelhoMarca} ${ordem.aparelhoModelo}`,
              detalhe: `Ordem de serviço · ${ordem.statusOS?.replaceAll('_', ' ') ?? 'Sem status'}`,
              destino: `/ordens-de-servico?q=${encodeURIComponent(ordem.id)}`,
            })),
          ])
          setErro('')
        })
        .catch((e: unknown) => {
          if (ativo) setErro(e instanceof Error ? e.message : 'Não foi possível fazer a busca.')
        })
        .finally(() => { if (ativo) setCarregando(false) })
    }, 250)

    return () => {
      ativo = false
      window.clearTimeout(timer)
    }
  }, [q])

  const ir = (destino: string) => {
    navigate(destino)
    setQ('')
    setAberto(false)
    setCarregando(false)
  }

  return (
    <div className={styles.wrap}>
      <input
        placeholder="Buscar por CPF, nome ou Nº OS..."
        aria-label="Busca global"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setAberto(true)
          setCarregando(e.target.value.trim().length >= 2)
          setErro('')
          setResultados([])
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => setTimeout(() => setAberto(false), 150)}
        onKeyDown={(e) => e.key === 'Enter' && resultados[0] && ir(resultados[0].destino)}
      />
      {aberto && q.trim().length >= 2 && (
        <ul className={styles.lista} role="listbox">
          {carregando && <li className={styles.vazio}>Buscando...</li>}
          {erro && <li role="alert" className={styles.vazio}>{erro}</li>}
          {!carregando && !erro && resultados.length === 0 && <li className={styles.vazio}>Nada encontrado.</li>}
          {resultados.map((r) => (
            <li key={r.chave} role="option" aria-selected={false}>
              <button onMouseDown={() => ir(r.destino)}>
                <strong>{r.titulo}</strong>
                <small>{r.detalhe}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
