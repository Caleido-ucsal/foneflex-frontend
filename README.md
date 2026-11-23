# FoneFlex – Front end

Front-end do sistema de gestão da **FoneFlex** (projeto de faculdade): loja de telefonia móvel com venda de aparelhos e conserto. O backend atual ainda não disponibiliza endpoints de locação.

Stack: React + Vite + TypeScript + React Router + React-Bootstrap (tema Bootstrap customizado via Sass).
Design: https://www.figma.com/design/ceb6rh6IknNUddfzan2jmx/FoneFlex--Copy- (referências em `docs/figma/`)

Redesign visual (antes × depois): [`docs/redesign-visual/`](docs/redesign-visual/README.md)

## Contexto (Documento 4.4)
Operação 100% em papel, equipe de 6 pessoas. Dores: perda de dados de clientes, falta de rastreio de ordens de serviço/orçamentos, sem controle de cobranças.

## Roadmap
1. **Fase 1 – Arrumando a casa** (este front): cadastro unificado de clientes, ordens de serviço, vendas e caixa.
2. **Fase 2 – MVP de aluguel presencial**: caução e termo de responsabilidade.
3. **Fase 3 – Plataforma online** para clientes finais.

## Etapas do front
- [x] 1. Base do projeto
- [x] 2. Design system e layout (tokens, componentes base, sidebar/topbar, login, visão geral)
- [x] 3. Clientes (listagem, busca, cadastro com máscaras, histórico)
- [x] 4. Ordens de serviço (filtros, busca, troca de status, Nova OS em 4 passos)
- [x] 5. Vendas e integração com produtos, estoque e pagamentos
- [x] 6. Visão Geral com dados da API, busca global, layout responsivo e login autenticado

## Rodando
```
npm install
npm run dev
```

Em desenvolvimento, o Vite encaminha `/api` para `http://localhost:8080` (porta padrão do Spring Boot). Deixe `VITE_API_URL` sem definir para usar esse proxy. Como o backend atual não configura CORS, uma publicação em outra origem precisa de um proxy reverso same-origin; apontar diretamente o navegador para o backend cross-origin não funciona.

O login usa HTTP Basic com e-mail e senha cadastrados no backend (`POST /usuarios` é público; as demais rotas exigem autenticação). As credenciais permanecem apenas em memória e precisam ser informadas novamente após recarregar a página.

Validação local:
```
npm run build
npm run lint
```

## Telas
| Rota | Tela |
|---|---|
| `/login` | Login autenticado pela API e cadastro de usuário |
| `/` | Indicadores e ordens abertas carregados da API |
| `/ordens-de-servico` | Ordens, filtros, atualização de status e cadastro |
| `/vendas` | Produtos/estoque, carrinho, venda e pagamento |
| `/locacoes` | Informativo: o backend atual não possui rotas de locação |
| `/clientes` | Clientes e histórico de OS/compras carregados da API |

## Arquitetura
- `src/services/`: camada de dados para usuários, clientes, produtos, ordens, vendas, produtos da venda e pagamentos.
- `src/services/api.ts`: HTTP Basic, serialização JSON e apresentação de erros da API.
- `src/styles/theme.scss`: tema Bootstrap. Sobrescreve as variáveis do framework com a paleta da marca (`_brand.scss`) e a fonte Inter; `_shell.scss` e `_components.scss` trazem os estilos próprios.
- `src/components/ui`: peças sobre o React-Bootstrap (badges de status, paginação, estados de carregamento/vazio, toasts, stepper). `src/components/layout`: sidebar (offcanvas no mobile), topbar, busca global, notificações.
- `src/pages/`: uma pasta por módulo com seus modais.

## Regras implementadas (do documento 4.4)
- Cadastro unificado de clientes, reaproveitado em OS e vendas.
- Rastreio de OS por status e histórico por cliente.
- Vendas registram produtos e pagamentos pelos endpoints disponíveis, aceitando mais de uma forma de pagamento desde que as parcelas somem o total.
- Locações e caixa de diárias/cauções permanecem indisponíveis até o backend expor esses recursos.

## Pendências / próximos passos
- Substituir a logo aproximada pelo arquivo oficial em alta resolução.
- Implementar endpoints de locação e os recursos de caixa associados no backend antes de habilitá-los no frontend.
- Perfis de acesso (o cliente ainda não definiu papéis entre os 6 funcionários).
- Fase 3: plataforma online para clientes finais.
