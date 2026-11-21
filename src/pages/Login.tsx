import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button, Input } from '../components/ui'
import { Logo } from '../components/layout/Logo'
import { useAuth } from '../services/auth'
import { criarUsuario } from '../services/usuarios'
import styles from './Login.module.css'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [modoCadastro, setModoCadastro] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (user) return <Navigate to="/" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    setSucesso('')

    if (!modoCadastro) {
      if (login(email, senha)) navigate('/')
      else setErro('Informe e-mail/login e senha.')
      return
    }

    setEnviando(true)
    try {
      const resposta = await criarUsuario({ nome: nome.trim(), email: email.trim(), senha, ativo: true })
      setSucesso(resposta.message || 'Usuário criado com sucesso. Faça login para continuar.')
      setModoCadastro(false)
      setNome('')
      setSenha('')
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível criar o usuário.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.left}>
        <Logo dark size={64} />
        <h1>{modoCadastro ? 'Criar usuário' : 'Inicie sessão'}</h1>
        <p>{modoCadastro ? 'Cadastre um usuário para acessar o sistema' : 'Entre com suas credenciais para acessar o sistema'}</p>
      </section>
      <section className={styles.right}>
        <form onSubmit={onSubmit} className={styles.form}>
          {modoCadastro && <Input id="nome" placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />}
          <Input id="email" type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <div>
            <Input id="senha" type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} minLength={6} maxLength={20} required />
            {!modoCadastro && <a href="#" className={styles.forgot}>Esqueceu sua senha?</a>}
          </div>
          {erro && <p className={styles.erro}>{erro}</p>}
          {sucesso && <p className={styles.sucesso}>{sucesso}</p>}
          <Button variant="accent" type="submit" block disabled={enviando}>{enviando ? 'Enviando...' : modoCadastro ? 'Criar usuário' : 'Entrar'}</Button>
          <button type="button" className={styles.alternar} onClick={() => { setModoCadastro(!modoCadastro); setErro(''); setSucesso('') }}>
            {modoCadastro ? 'Já tem cadastro? Entrar' : 'Criar usuário'}
          </button>
        </form>
        <footer>Desenvolvido por <b>Caleido</b></footer>
      </section>
    </div>
  )
}
