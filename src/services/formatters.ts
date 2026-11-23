export const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const dataBR = (data: string) => {
  const somenteData = data.slice(0, 10)
  if (/^\d{2}[/-]\d{2}[/-]\d{4}$/.test(somenteData)) return somenteData.replace(/-/g, '/')
  return somenteData.split('-').reverse().join('/')
}

export const hojeISO = () => {
  const hoje = new Date()
  const doisDigitos = (valor: number) => String(valor).padStart(2, '0')
  return `${hoje.getFullYear()}-${doisDigitos(hoje.getMonth() + 1)}-${doisDigitos(hoje.getDate())}`
}
