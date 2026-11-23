import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Button, Card, FilterTabs } from '../components/ui'
import { listarClientesApi } from '../services/clientesApi'
import { brl, dataBR, hojeISO } from '../services/formatters'
import { buscarProdutosApi, listarProdutosApi } from '../services/produtosApi'
import { concluirVendaApi, VendaParcialError } from '../services/vendasApi'
import { BANDEIRAS_CARTAO, FORMAS_PAGAMENTO, type BandeiraCartaoApi, type MetodoPagamentoApi } from '../services/pagamentosApi'
import type { Cliente, FormaPagamento, ItemVenda, Produto, Venda } from '../types'
import styles from './Vendas.module.css'

const FILTROS = ['Todos', 'Smartphones', 'Acessórios'] as const
type Filtro = (typeof FILTROS)[number]
type PagamentoLinha = { id: number; metodo: FormaPagamento; bandeiraCartao?: BandeiraCartaoApi; valor: string }

const icone = (p: Produto) => (p.categoria === 'Smartphones' ? '📱' : '🔌')

const parseValor = (valor: string) => {
  const entrada = valor.trim().replace(/\s/g, '')
  const normalizado = entrada.includes(',')
    ? entrada.replace(/\./g, '').replace(',', '.')
    : entrada
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? Math.round(numero * 100) : 0
}

const valorInput = (centavos: number) => (centavos / 100).toFixed(2).replace('.', ',')
const metodoCartao = (metodo: FormaPagamento) => metodo === 'Cartão de Crédito' || metodo === 'Cartão de Débito'

export default function Vendas() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState<Filtro>('Todos')
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([])
  const [clienteTxt, setClienteTxt] = useState('')
  const [pagamentos, setPagamentos] = useState<PagamentoLinha[]>([{ id: 1, metodo: 'PIX', valor: '' }])
  const [recibo, setRecibo] = useState<Venda | null>(null)
  const [erroClientes, setErroClientes] = useState('')
  const [erroProdutos, setErroProdutos] = useState('')
  const [erroOperacao, setErroOperacao] = useState('')
  const [carregandoProdutos, setCarregandoProdutos] = useState(true)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    listarClientesApi()
      .then(setClientes)
      .catch((e: unknown) => setErroClientes(e instanceof Error ? e.message : 'Não foi possível carregar os clientes.'))
  }, [])

  useEffect(() => {
    let ativo = true
    const timer = window.setTimeout(() => {
      const consulta = busca.trim() ? buscarProdutosApi(busca.trim()) : listarProdutosApi()
      consulta.then((lista) => {
        if (ativo) {
          setProdutos(lista)
          setErroProdutos('')
        }
      }).catch((e: unknown) => {
        if (ativo) setErroProdutos(e instanceof Error ? e.message : 'Não foi possível buscar produtos.')
      }).finally(() => {
        if (ativo) setCarregandoProdutos(false)
      })
    }, busca.trim() ? 250 : 0)
    return () => {
      ativo = false
      window.clearTimeout(timer)
    }
  }, [busca])

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return produtos.filter((p) => (filtro === 'Todos' || p.categoria === filtro) && p.nome.toLowerCase().includes(q))
  }, [produtos, filtro, busca])

  const cliente = useMemo(() => {
    const q = clienteTxt.trim().toLowerCase()
    if (!q) return undefined
    const digitos = q.replace(/\D/g, '')
    return clientes.find(
      (c) => c.nome.toLowerCase() === q || (digitos.length >= 11 && c.cpf.replace(/\D/g, '') === digitos),
    )
  }, [clientes, clienteTxt])

  const total = carrinho.reduce((t, i) => t + i.preco * i.qtd, 0)
  const totalCentavos = Math.round(total * 100)
  const pagamentosNormalizados = pagamentos.map((item) => ({
    metodo: item.metodo,
    valorCentavos: parseValor(item.valor || (pagamentos.length === 1 ? valorInput(totalCentavos) : '')),
  }))
  const somaPagamentos = pagamentosNormalizados.reduce((soma, item) => soma + item.valorCentavos, 0)
  const restantePagamento = totalCentavos - somaPagamentos
  const pagamentosValidos = totalCentavos === 0
    ? pagamentos.every((item) => !item.valor || parseValor(item.valor) === 0)
    : pagamentos.length > 0 &&
      pagamentosNormalizados.every((item) => item.valorCentavos > 0) &&
      pagamentos.every((item) => !metodoCartao(item.metodo) || item.bandeiraCartao !== undefined) &&
      somaPagamentos === totalCentavos
  const qtdNoCarrinho = (id: string) => carrinho.find((i) => i.produtoId === id)?.qtd ?? 0

  const adicionarPagamento = () => {
    setPagamentos((linhas) => {
      const proximoId = Math.max(0, ...linhas.map((linha) => linha.id)) + 1
      return [
        ...linhas.map((linha) => linha.valor.trim() ? linha : {
          ...linha,
          valor: linhas.length === 1 ? valorInput(totalCentavos) : linha.valor,
        }),
        { id: proximoId, metodo: 'PIX', valor: '' },
      ]
    })
  }

  const adicionar = (p: Produto) => {
    if (qtdNoCarrinho(p.id) >= p.estoque) return
    setRecibo(null)
    setCarrinho((c) =>
      c.some((i) => i.produtoId === p.id)
        ? c.map((i) => (i.produtoId === p.id ? { ...i, qtd: i.qtd + 1 } : i))
        : [...c, { produtoId: p.id, nome: p.nome, preco: p.preco, qtd: 1 }],
    )
  }

  const alterarQtd = (id: string, delta: number) => {
    const estoque = produtos.find((p) => p.id === id)?.estoque ?? 0
    setCarrinho((c) =>
      c.map((i) => (i.produtoId === id ? { ...i, qtd: Math.min(estoque, i.qtd + delta) } : i)).filter((i) => i.qtd > 0),
    )
  }

  const finalizar = async () => {
    if (clienteTxt.trim() && !cliente) {
      setErroOperacao('Cliente não encontrado. Selecione um cliente cadastrado ou limpe o campo para vender sem identificação.')
      return
    }
    setEnviando(true)
    setErroOperacao('')
    try {
      const formasApi: Record<FormaPagamento, MetodoPagamentoApi> = {
        PIX: 'PIX',
        'Cartão de Crédito': 'CARTAO_CREDITO',
        'Cartão de Débito': 'CARTAO_DEBITO',
        Dinheiro: 'DINHEIRO',
      }
      if (!pagamentosValidos) {
        setErroOperacao('Informe uma bandeira para cada parcela de cartão e confira se os valores somam o total da venda.')
        setEnviando(false)
        return
      }

      const vendaId = await concluirVendaApi(
        cliente ? Number(cliente.id) : undefined,
        carrinho.map((item) => ({ produtoId: Number(item.produtoId), quantidade: item.qtd })),
        pagamentosNormalizados
          .filter((item) => item.valorCentavos > 0)
          .map((item, index) => ({
            metodoPagamento: formasApi[item.metodo],
            ...(pagamentos[index].bandeiraCartao ? { bandeiraCartao: pagamentos[index].bandeiraCartao } : {}),
            valor: item.valorCentavos / 100,
          })),
      )
      const resumoPagamento = pagamentosNormalizados
        .filter((item) => item.valorCentavos > 0)
        .map((item) => `${item.metodo}: ${brl(item.valorCentavos / 100)}`)
        .join(' + ')
      const venda: Venda = {
        id: String(vendaId),
        data: hojeISO(),
        clienteId: cliente?.id,
        itens: carrinho,
        total,
        pagamento: resumoPagamento || 'Não informado',
      }
      setRecibo(venda)
      setCarrinho([])
      setClienteTxt('')
      setPagamentos([{ id: 1, metodo: 'PIX', valor: '' }])
      try {
        setProdutos(await listarProdutosApi())
      } catch (e) {
        setErroProdutos(e instanceof Error ? `Venda registrada, mas não foi possível atualizar o estoque exibido: ${e.message}` : 'Venda registrada, mas não foi possível atualizar o estoque exibido.')
      }
    } catch (e) {
      setErroOperacao(e instanceof Error ? e.message : 'Não foi possível concluir a venda.')
      if (e instanceof VendaParcialError) {
        setCarrinho([])
        setClienteTxt('')
        try {
          setProdutos(await listarProdutosApi())
        } catch (erroEstoque) {
          setErroProdutos(erroEstoque instanceof Error ? `Não foi possível atualizar o estoque após a venda parcial: ${erroEstoque.message}` : 'Não foi possível atualizar o estoque após a venda parcial.')
        }
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.layout}>
      <section>
        <PageHeader title="Vendas de Balcão" subtitle={`${produtos.length} produtos em estoque`} />
        <Card className={styles.filtros}>
          <FilterTabs options={FILTROS} value={filtro} onChange={setFiltro} />
          <input
            placeholder="Buscar produto..."
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value)
              setCarregandoProdutos(true)
              setErroProdutos('')
            }}
          />
        </Card>
        {erroProdutos && <p role="alert" className={styles.erro}>{erroProdutos}</p>}
        {erroClientes && <p role="alert" className={styles.erro}>{erroClientes}</p>}
        {erroOperacao && <p role="alert" className={styles.erro}>{erroOperacao}</p>}

        <div className={styles.grid}>
          {visiveis.map((p) => {
            const esgotado = p.estoque - qtdNoCarrinho(p.id) <= 0
            return (
              <button key={p.id} className={styles.produto} onClick={() => adicionar(p)} disabled={esgotado}>
                <span className={styles.icone} aria-hidden="true">{icone(p)}</span>
                <strong>{p.nome}</strong>
                <small>{p.categoria}</small>
                <div>
                  <b>{brl(p.preco)}</b>
                  <span>{p.estoque === 0 ? 'Esgotado' : `${p.estoque} unidade${p.estoque > 1 ? 's' : ''}`}</span>
                </div>
              </button>
            )
          })}
          {carregandoProdutos && <p className={styles.vazio}>Carregando produtos...</p>}
          {!carregandoProdutos && !erroProdutos && visiveis.length === 0 && <p className={styles.vazio}>Nenhum produto encontrado.</p>}
        </div>
      </section>

      <Card className={styles.carrinho}>
        <header>
          <h2>Carrinho</h2>
          <small>{carrinho.reduce((t, i) => t + i.qtd, 0)} item(s)</small>
        </header>

        <div className={styles.itens}>
          {recibo && (
            <div className={styles.recibo} role="status">
              <b>Venda {recibo.id} registrada</b>
              <span>{dataBR(recibo.data)} · {recibo.pagamento} · {brl(recibo.total)}</span>
              <Button variant="secondary" onClick={() => window.print()}>Imprimir recibo</Button>
            </div>
          )}
          {carrinho.length === 0 && !recibo && <p className={styles.vazio}>🛒<br />Carrinho vazio</p>}
          {carrinho.map((i) => (
            <div key={i.produtoId} className={styles.linha}>
              <div><strong>{i.nome}</strong><small>{brl(i.preco)}</small></div>
              <div className={styles.qtd}>
                <button onClick={() => alterarQtd(i.produtoId, -1)} aria-label={`Remover ${i.nome}`}>−</button>
                <span>{i.qtd}</span>
                <button onClick={() => alterarQtd(i.produtoId, 1)} aria-label={`Adicionar ${i.nome}`}>＋</button>
              </div>
            </div>
          ))}
        </div>

        <footer>
          <label>
            Cliente (opcional)
            <input placeholder="Nome ou CPF" value={clienteTxt} onChange={(e) => setClienteTxt(e.target.value)} />
          </label>
          {cliente && <small className={styles.ok}>Cliente: {cliente.nome}</small>}

          <div className={styles.pagamentoTitulo}>
            <span className={styles.rotulo}>Formas de Pagamento</span>
            <Button type="button" variant="secondary" onClick={adicionarPagamento} disabled={total <= 0}>＋ Adicionar</Button>
          </div>
          <div className={styles.pagamentos}>
            {pagamentos.map((item, index) => (
              <div className={styles.pagamentoLinha} key={item.id}>
                <label>
                  <span className={styles.rotulo}>{pagamentos.length > 1 ? `Parcela ${index + 1}` : 'Forma de pagamento'}</span>
                  <select
                    value={item.metodo}
                    onChange={(event) => setPagamentos((linhas) => linhas.map((linha) =>
                    linha.id === item.id ? { ...linha, metodo: event.target.value as FormaPagamento, bandeiraCartao: undefined } : linha,
                    ))}
                  >
                    {FORMAS_PAGAMENTO.map((forma) => <option key={forma} value={forma}>{forma}</option>)}
                  </select>
                </label>
                <label>
                  <span className={styles.rotulo}>Valor (R$)</span>
                  <input
                    inputMode="decimal"
                    placeholder="0,00"
                    value={item.valor || (pagamentos.length === 1 ? valorInput(totalCentavos) : '')}
                    onChange={(event) => setPagamentos((linhas) => linhas.map((linha) =>
                      linha.id === item.id ? { ...linha, valor: event.target.value.replace(/[^\d.,]/g, '') } : linha,
                    ))}
                  />
                </label>
                {metodoCartao(item.metodo) && (
                  <label className={styles.bandeira}>
                    <span className={styles.rotulo}>Bandeira do cartão *</span>
                    <select
                      value={item.bandeiraCartao ?? ''}
                      required
                      onChange={(event) => setPagamentos((linhas) => linhas.map((linha) =>
                        linha.id === item.id
                          ? { ...linha, bandeiraCartao: event.target.value ? event.target.value as BandeiraCartaoApi : undefined }
                          : linha,
                      ))}
                    >
                      <option value="">Selecione a bandeira</option>
                      {BANDEIRAS_CARTAO.map((bandeira) => <option key={bandeira.value} value={bandeira.value}>{bandeira.label}</option>)}
                    </select>
                  </label>
                )}
                {pagamentos.length > 1 && (
                  <button
                    type="button"
                    className={styles.removerPagamento}
                    aria-label={`Remover parcela ${index + 1}`}
                    onClick={() => setPagamentos((linhas) => linhas.filter((linha) => linha.id !== item.id))}
                  >×</button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.total}><span>Total</span><strong>{brl(total)}</strong></div>
          <div className={restantePagamento === 0 ? styles.pagamentoOk : styles.pagamentoPendente} aria-live="polite">
            {restantePagamento === 0
              ? `Pagamentos conferem: ${brl(somaPagamentos / 100)}`
              : restantePagamento > 0
                ? `Falta distribuir ${brl(restantePagamento / 100)}`
                : `Valor excedente de ${brl(Math.abs(restantePagamento) / 100)}`}
          </div>
          <Button block disabled={carrinho.length === 0 || enviando || !pagamentosValidos} onClick={finalizar}>{enviando ? 'Registrando...' : 'Finalizar Venda e Emitir Recibo'}</Button>
        </footer>
      </Card>
    </div>
  )
}
