import { PageHeader } from '../components/layout/PageHeader'
import { Card } from '../components/ui'
import styles from './Locacoes.module.css'

export default function Locacoes() {
  return (
    <>
      <PageHeader
        title="Locação de Aparelhos"
        subtitle="Integração indisponível"
      />
      <Card className={styles.table}>
        <p role="status" className={styles.empty}>
          O backend atual não possui endpoints para consultar, criar ou registrar devoluções de locações.
          Esta tela não exibe nem grava os dados de demonstração locais.
        </p>
      </Card>
    </>
  )
}
