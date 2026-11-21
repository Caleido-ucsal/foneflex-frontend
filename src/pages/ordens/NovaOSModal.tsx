import { useState } from 'react'
import { Button, Input, Modal, Stepper } from '../../components/ui'
import type { Cliente } from '../../types'
import { cpfValido, maskCpf, maskTelefone, telefoneValido } from '../../services/masks'
import { brl } from '../../services/mock'

const PASSOS = ['Cliente', 'Dispositivo', 'Diagnóstico', 'Confirmação']

export type NovaOSForm = {
  nome: string
  cpf: string
  telefone: string
  aparelhoMarca: string
  aparelhoModelo: string
  numeroSerieImei: string
  descricaoProblema: string
  valorEstimado: number
}

type Props = { onClose: () => void; onSave: (dados: NovaOSForm) => Promise<void>; clientes: Cliente[]; apiError?: string }

export function NovaOSModal({ onClose, onSave, clientes, apiError }: Props) {
  const [passo, setPasso] = useState(0)
  const [cpf, setCpf] = useState('')
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [marca, setMarca] = useState('')
  const [aparelho, setAparelho] = useState('')
  const [imei, setImei] = useState('')
  const [defeito, setDefeito] = useState('')
  const [valor, setValor] = useState('')
  const [salvando, setSalvando] = useState(false)

  const onCpf = (v: string) => {
    const masked = maskCpf(v)
    setCpf(masked)
    const existente = clientes.find((cliente) => cliente.cpf.replace(/\D/g, '') === masked.replace(/\D/g, ''))
    if (existente) {
      setNome(existente.nome)
      setTelefone(existente.telefone)
    }
  }
  const clienteEncontrado = clientes.find((cliente) => cliente.cpf.replace(/\D/g, '') === cpf.replace(/\D/g, ''))

  const valorNum = Number(valor.replace(',', '.')) || 0
  const podeAvancar = [
    nome.trim().length > 2 && cpfValido(cpf) && telefoneValido(telefone),
    marca.trim().length > 1 && aparelho.trim().length > 1 && imei.trim().length > 0,
    defeito.trim().length > 2,
    true,
  ][passo]

  const confirmar = async () => {
    setSalvando(true)
    try {
      await onSave({
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        telefone: telefone.replace(/\D/g, ''),
        aparelhoMarca: marca.trim(),
        aparelhoModelo: aparelho.trim(),
        numeroSerieImei: imei.trim(),
        descricaoProblema: defeito.trim(),
        valorEstimado: valorNum,
      })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal title="Abrir Nova Ordem de Serviço" onClose={onClose} width={795}>
      <Stepper steps={PASSOS} current={passo} />
      {apiError && <p role="alert" style={{ color: '#b91c1c', fontSize: 13, margin: '12px 0' }}>{apiError}</p>}

      {passo === 0 && (
        <Secao titulo="Dados do cliente">
          <Input label="CPF *" placeholder="000.000.000-00" value={cpf} onChange={(e) => onCpf(e.target.value)} />
          <Input label="Nome Completo *" placeholder="Nome do cliente" value={nome} onChange={(e) => setNome(e.target.value)} />
          <Input label="Telefone *" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(maskTelefone(e.target.value))} />
          {clienteEncontrado && <small style={{ gridColumn: '1 / -1', color: 'var(--success)' }}>Cliente já cadastrado — dados preenchidos.</small>}
        </Secao>
      )}
      {passo === 1 && (
        <Secao titulo="Dados do dispositivo">
          <Input label="Marca *" placeholder="Ex.: Samsung" value={marca} onChange={(e) => setMarca(e.target.value)} />
          <Input label="Modelo *" placeholder="Ex.: Galaxy A54" value={aparelho} onChange={(e) => setAparelho(e.target.value)} />
          <Input label="IMEI / número de série *" placeholder="Identificação do aparelho" value={imei} onChange={(e) => setImei(e.target.value)} />
        </Secao>
      )}
      {passo === 2 && (
        <Secao titulo="Diagnóstico">
          <Input label="Defeito relatado *" placeholder="Descreva o problema" value={defeito} onChange={(e) => setDefeito(e.target.value)} />
          <Input label="Valor do orçamento (R$)" inputMode="decimal" placeholder="0,00" value={valor} onChange={(e) => setValor(e.target.value)} />
        </Secao>
      )}
      {passo === 3 && (
        <Secao titulo="Confirme os dados">
          <Resumo itens={[['Cliente', nome], ['CPF', cpf], ['Telefone', telefone], ['Aparelho', `${marca} ${aparelho} (${imei})`], ['Defeito', defeito], ['Orçamento', brl(valorNum)]]} />
        </Secao>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 20 }}>
        <Button variant="secondary" onClick={passo === 0 ? onClose : () => setPasso(passo - 1)}>{passo === 0 ? 'Cancelar' : '← Voltar'}</Button>
        {passo < 3 ? (
          <Button disabled={!podeAvancar} onClick={() => setPasso(passo + 1)}>Próximo →</Button>
        ) : (
          <Button variant="accent" onClick={confirmar} disabled={salvando}>{salvando ? 'Cadastrando...' : 'Abrir OS'}</Button>
        )}
      </div>
    </Modal>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ fontSize: 11, color: 'var(--navy-700)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>{titulo}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>{children}</div>
    </div>
  )
}

function Resumo({ itens }: { itens: [string, string][] }) {
  return (
    <dl style={{ gridColumn: '1 / -1', margin: 0, background: 'var(--surface-muted)', borderRadius: 8, padding: 16, display: 'grid', gap: 8 }}>
      {itens.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <dt className="muted">{k}</dt>
          <dd style={{ margin: 0, fontWeight: 600 }}>{v}</dd>
        </div>
      ))}
    </dl>
  )
}

