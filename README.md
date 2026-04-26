<div align="center">

# 🏛️ Portal Câmara

### Plataforma de Transparência Legislativa da Câmara dos Deputados

Uma aplicação web moderna e de alta performance para consulta e análise de dados públicos da atividade parlamentar brasileira — construída com foco em **transparência**, **acessibilidade** e **experiência de usuário premium**.

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query/latest)
[![TanStack Table](https://img.shields.io/badge/TanStack_Table-8-FF4154?style=for-the-badge&logo=react-table&logoColor=white)](https://tanstack.com/table/latest)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3-FF6B6B?style=for-the-badge&logo=chart.js&logoColor=white)](https://recharts.org/)
[![Lucide](https://img.shields.io/badge/Lucide-Icons-F56565?style=for-the-badge&logo=feather&logoColor=white)](https://lucide.dev/)
[![License](https://img.shields.io/badge/License-LAI-22C55E?style=for-the-badge&logo=open-access&logoColor=white)](#-licença)

<br />

[**Funcionalidades**](#-funcionalidades) · [**Arquitetura**](#-arquitetura) · [**Instalação**](#-instalação) · [**Scripts**](#-scripts-disponíveis) · [**API**](#-endpoints-da-api) · [**Contribuição**](#-contribuindo)

</div>

<br />

---

## ✨ Funcionalidades

| Módulo | Descrição |
|:---|:---|
| 🕵️ **Exploração de Deputados** | Listagem e busca dos 513 deputados federais com filtros por nome, partido e UF |
| 💰 **Despesas (CEAP)** | Detalhamento mensal e anual da Cota para Exercício da Atividade Parlamentar |
| 🗳️ **Votações** | Histórico de votações com placar da casa, voto individual e orientação de bancada |
| 📝 **Trabalho Legislativo** | Proposições de autoria do parlamentar com status de tramitação em tempo real |
| 🎙️ **Discursos** | Pronunciamentos em plenário com transcrição completa, áudio e vídeo |
| 💸 **Emendas Orçamentárias** | Execução financeira das emendas (autorizado, empenhado, pago) |
| 🏢 **Equipe de Gabinete** | Assessores ativos com cargo e remuneração, sincronizados via Supabase |
| 📊 **Benefícios do Mandato** | Salário, auxílio-moradia, passaporte diplomático, missões e gabinete |
| 📅 **Frequência Parlamentar** | Presença em plenário e comissões com dados históricos (2019–2026) |
| ⚔️ **Batalha de Gigantes** | Comparativo lado a lado entre dois deputados em todas as métricas |
| 🏠 **Frentes Parlamentares** | Bancadas e frentes das quais o deputado participa |
| 📈 **Produção Legislativa** | Totais de autoria, relatorias e atos processuais por ano |

---

## 🏗️ Arquitetura

O projeto segue uma **Feature-Based Architecture** com domínios isolados, inspirada em padrões de empresas como Vercel, Linear e Stripe:

```
src/
├── app/                              # Next.js App Router (Rotas & Páginas)
│   ├── api/                          #   ├── API Routes (BFF para scraping e cache)
│   │   ├── cron/                     #   │   ├── Vercel Cron Jobs (Sincronização Automática)
│   │   ├── beneficios/               #   │   ├── Benefícios do mandato
│   │   ├── emendas/                  #   │   ├── Emendas orçamentárias
│   │   ├── frequencia/               #   │   └── Frequência parlamentar
│   ├── comparativo/                  #   ├── Batalha de Gigantes (comparativo)
│   ├── deputados/                    #   ├── Listagem de deputados
│   │   └── [id]/                     #   │   └── Perfil detalhado (orquestrador fino)
│   └── sobre/                        #   └── Página sobre o projeto
│
├── features/                         # Módulos por Domínio de Negócio (Arquitetura Modular)
│   ├── home/                         #   ├── Módulo Página Inicial
│   │   ├── components/               #   │   ├── Hero, RankingsSection, ParliamentaryCosts...
│   │   └── constants.ts              #   │
│   ├── comparativo/                  #   ├── Módulo Batalha de Gigantes
│   │   ├── components/               #   │   ├── ComparisonTable, ComparisonSlot, SearchOverlay...
│   │   ├── hooks/                    #   │   ├── useComparisonData (Lógica de Pontuação)
│   │   └── constants.ts              #   │
│   └── deputado/                     #   ├── Módulo Perfil do Parlamentar
│       ├── components/               #   │   ├── DeputadoSidebar, BentoGrid, 6 Cards
│       ├── tabs/                     #   │   ├── Despesas, Frentes, Votações, Trabalho...
│       ├── expansions/               #   │   ├── Detalhes expandidos (votação, proposição)
│       └── columns/                  #   │   ├── Definições de colunas TanStack Table
│
├── components/                       # UI Primitivos Reutilizáveis (Design System)
│   ├── ui/                           #   ├── Botões, Inputs, Badges customizados
│   ├── DataTable.tsx                 #   ├── Tabela genérica (TanStack Table)
│   └── ExpensesDonutChart.tsx        #   └── Gráfico donut (Recharts)
│   ├── Pagination.tsx                #   └── Paginação reutilizável
│   └── ...
│
├── hooks/                            # Custom Hooks (TanStack Query)
│   └── use-camara.ts                 #   └── 25+ hooks para a API da Câmara
│
├── lib/                              # Camada de Integração
│   ├── camara.ts                     #   ├── Client da API Dados Abertos v2
│   ├── supabase.ts                   #   ├── Client Supabase
│   ├── formatters.ts                 #   ├── Utilitários de formatação
│   ├── constants.ts                  #   └── Constantes globais
│   └── query-keys.ts                 #
│
├── scripts/                          # ETL & Sincronização de Dados
│   ├── sync-secretarios.mjs          #   ├── Importação de assessores (CSV → Supabase)
│   ├── sync-beneficios.mjs           #   ├── Scraping de benefícios do mandato
│   ├── sync-frequencia.mjs           #   ├── Scraping de frequência parlamentar
│   ├── sync-emendas.mjs              #   └── Scraping de emendas orçamentárias
│   └── ...
│
└── styles/                           # Design System (CSS Global & Tokens)
```

### Design Patterns

| Padrão | Aplicação |
|:---|:---|
| **Feature-Based Architecture** | Código organizado por domínio de negócio (`features/deputado/`) |
| **Repository Pattern** | Funções puras em `lib/` para comunicação com APIs |
| **Custom Hooks Pattern** | Lógica de TanStack Query encapsulada em hooks autocontidos |
| **Orchestrator Pattern** | `page.tsx` como orquestrador fino (~100 linhas), delegando para módulos |
| **Colocation** | Cada tab gerencia seus próprios hooks (TanStack Query faz deduplicação) |
| **Smart Search (Debounce)** | Delay de 500ms + mínimo 3 caracteres para otimizar chamadas de rede |
| **Skeleton Screens** | Loading states preditivos para alta percepção de performance |
| **Graceful Degradation** | Sistema funcional mesmo sem Supabase ou com APIs instáveis |

---

## 🚀 Instalação

### Pré-requisitos

| Requisito | Versão Mínima |
|:---|:---|
| [Node.js](https://nodejs.org/) | `v18.0+` |
| [pnpm](https://pnpm.io/) | `v8.0+` (recomendado) |
| [Supabase](https://supabase.com/) | Projeto criado (opcional) |

### Setup Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/Christie-Cardoso/portal-camara.git
cd portal-camara

# 2. Instale as dependências
pnpm install

# 3. Configure o ambiente
cp .env.example .env.local
```

Edite o `.env.local` com suas credenciais:

```env
# Supabase (opcional — o sistema funciona sem, ocultando features dependentes)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui

# Vercel Cron (Segurança para rotas de sincronização)
CRON_SECRET=sua_chave_secreta_aqui
```

```bash
# 4. Inicie o servidor de desenvolvimento
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) ✨

---

## 📦 Scripts Disponíveis

| Comando | Descrição |
|:---|:---|
| `pnpm dev` | Inicia o servidor de desenvolvimento (Turbopack) |
| `pnpm build` | Gera a versão de produção otimizada |
| `pnpm start` | Serve a build de produção |
| `pnpm lint` | Executa o linter (ESLint) |
| `pnpm sync:secretarios` | Sincroniza assessores parlamentares (CSV → Supabase) |
| `pnpm sync:beneficios` | Faz scraping dos benefícios do mandato |
| `pnpm sync:frequencia` | Sincroniza frequência parlamentar histórica (2019–2026) |
| `pnpm sync:emendas` | Importa dados de emendas orçamentárias |

> **Nota:** Os scripts `sync:*` requerem as variáveis de ambiente do Supabase configuradas.

---

## 🕒 Automação com Vercel Cron

O projeto utiliza **Vercel Cron Jobs** para manter o banco de dados Supabase sincronizado automaticamente toda semana.

| Rota | Agendamento | Descrição |
|:---|:---|:---|
| `/api/cron/sync-frequencia` | Seg. às 02:00 | Sincroniza presença de todos os deputados |
| `/api/cron/sync-beneficios` | Seg. às 03:00 | Atualiza salários e benefícios do mandato |
| `/api/cron/sync-emendas` | Seg. às 04:00 | Sincroniza execução de emendas orçamentárias |
| `/api/cron/sync-secretarios` | Seg. às 05:00 | Atualiza a lista oficial de funcionários |
| `/api/cron/sync-remuneracao` | Seg. às 06:00 | Vincula salários detalhados aos secretários |

> **Segurança:** As rotas de Cron são protegidas por um token `Bearer`. Certifique-se de configurar a variável `CRON_SECRET` no painel do Vercel e no seu `.env.local`.

---

## 🔌 Endpoints da API

### API da Câmara dos Deputados (Dados Abertos v2)

| Recurso | Endpoint | Descrição |
|:---|:---|:---|
| Deputados | `GET /deputados` | Listagem com filtros de nome, partido e UF |
| Detalhes | `GET /deputados/{id}` | Perfil completo do parlamentar |
| Despesas | `GET /deputados/{id}/despesas` | Histórico de gastos (CEAP) |
| Órgãos | `GET /deputados/{id}/orgaos` | Comissões ativas |
| Frentes | `GET /deputados/{id}/frentes` | Frentes parlamentares |
| Discursos | `GET /deputados/{id}/discursos` | Pronunciamentos em plenário |
| Votações | `GET /votacoes` | Lista de votações da casa |
| Votos | `GET /votacoes/{id}/votos` | Voto individual por votação |
| Partidos | `GET /partidos` | Lista de partidos |

### API Routes Internas (BFF)

| Rota | Método | Descrição |
|:---|:---|:---|
| `/api/beneficios` | `GET` | Proxy com cache para benefícios do mandato |
| `/api/emendas` | `GET` | Proxy com cache para emendas orçamentárias |
| `/api/frequencia` | `GET` | Cache-first + fallback scraping para frequência |
| `/api/proposicoes/legislative-totals` | `GET` | Totais de produção legislativa |

---

## 🗄️ Banco de Dados (Supabase)

O Supabase é utilizado como camada de persistência para dados que requerem enriquecimento ou não estão disponíveis na API REST:

| Tabela | Descrição | Sincronização |
|:---|:---|:---|
| `secretarios` | Assessores vinculados aos gabinetes | `sync:secretarios` (CSV) |
| `frequencia_parlamentar` | Presença em plenário e comissões | `sync:frequencia` (Scraping) |

> **Graceful Degradation:** O sistema funciona 100% sem o Supabase configurado — apenas as features que dependem do banco ficam ocultas.

---

## 🎨 Design & UX

- **Bento Box Layout** — Grid premium de cards com glassmorphism e micro-animações
- **Dark Mode First** — Interface otimizada para temas escuros
- **Responsive-First** — Layout adaptativo para Desktop, Tablet e Mobile
- **Skeleton Loading** — Estados de carregamento preditivos para alta percepção de performance
- **Smart Search** — Busca com debounce de 500ms e trigger a partir do 3º caractere
- **Premium Aesthetics** — Gradientes suaves, hover effects, blur e sombras sofisticadas

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas alterações (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Convenção de Commits

Este projeto segue o [Conventional Commits](https://www.conventionalcommits.org/):

| Prefixo | Uso |
|:---|:---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `refactor:` | Refatoração sem mudança de comportamento |
| `docs:` | Atualização de documentação |
| `style:` | Formatação, sem mudança de lógica |
| `chore:` | Manutenção e tarefas auxiliares |

---

## 📜 Licença

Este projeto é desenvolvido para fins informativos e educacionais, utilizando exclusivamente **dados públicos** disponibilizados pela Câmara dos Deputados sob a [Lei de Acesso à Informação (LAI — Lei nº 12.527/2011)](http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm).

---

<div align="center">

**Feito com ☕ e transparência por [Christie Cardoso](https://github.com/Christie-Cardoso)**

Dados fornecidos pela [API Dados Abertos da Câmara dos Deputados](https://dadosabertos.camara.leg.br/)

</div>
