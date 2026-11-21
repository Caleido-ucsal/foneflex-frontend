import { useState, type FormEvent } from 'react'
import { Button, Input, Modal } from '../../components/ui'
import type { NovoCliente } from '../../services/clientes'
import { cpfValido, maskCpf, maskTelefone, telefoneValido } from '../../services/masks'

type Props = { onClose: () => void; onSave: (dados: NovoCliente) => void; apiError?: string }

export function NovoClienteModal({ onClose, onSave, apiError }: Props) {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')

  const valido = nome.trim().length > 2 && (!cpf.trim() || cpfValido(cpf)) && telefoneValido(telefone)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (valido) onSave({ nome: nome.trim(), cpf, telefone, email: email.trim() })
  }

  return (
    <Modal title="Cadastrar Novo Cliente" onClose={onClose}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Input label="Nome Completo *" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
        <Input label="CPF" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} />
        <Input label="Telefone *" placeholder="(11) 99999-9999" value={telefone} onChange={(e) => setTelefone(maskTelefone(e.target.value))} />
        <Input label="E-mail" type="email" placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        {apiError && <p role="alert" style={{ color: '#b91c1c', fontSize: 13, margin: 0 }}>{apiError}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 6 }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={!valido}>Cadastrar</Button>
        </div>
      </form>
    </Modal>
  )
}
