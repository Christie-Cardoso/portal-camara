# 🏛️ Portal Câmara - Transparência Legislativa

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=react-query)](https://tanstack.com/query/latest)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

O **Portal Câmara** é uma plataforma moderna de transparência e consulta de dados públicos da Câmara dos Deputados do Brasil. O projeto visa facilitar o acompanhamento da atividade parlamentar, gastos e pessoal através de uma interface intuitiva e performática.

---

## ✨ Funcionalidades Atuais

- 🕵️ **Exploração de Parlamentares**: Listagem dinâmica de todos os 513 deputados federais.
- 💰 **Monitoramento de Gastos**: Detalhamento mensal e anual da Cota Parlamentar (CEAP).
- 🗳️ **Acompanhamento de Votações**: Registros históricos e orientações de bancada em tempo real.
- 👥 **Gestão de Gabinete**: Consulta de secretários e pessoal vinculado aos parlamentares via Supabase.
- 🔍 **Filtros Inteligentes**: Busca por nome, partido e UF com carregamento instantâneo (Smart Search).

---

## 🏗️ Arquitetura do Sistema

O projeto utiliza o **Next.js App Router** como fundação, seguindo princípios de arquitetura limpa e separação de preocupações:

```text
src/
├── app/            # Camada de Roteamento e Páginas (Next.js)
├── components/     # UI Components (Átomos, Moléculas e Organismos)
├── hooks/          # Lógica Reativa e Abstração de Dados (TanStack Query)
├── lib/            # Camadas de Integração (API Câmara v2 & Supabase SDK)
├── scripts/        # Automação de Dados (ETL e Sincronização)
└── styles/         # Design System e Configurações Globais (CSS Moderno)
```

### Fluxo de Dados
A aplicação utiliza uma estratégia híbrida:
- **Client-Side Fetching**: Para dados voláteis da API da Câmara (Deputados, Despesas) usando TanStack Query para cache e performance.
- **Supabase Integration**: Para dados persistentes e enriquecidos (Secretários parlamentares).

---

## 🛠️ Como Iniciar

### Pré-requisitos
- Node.js (v18.0 ou superior)
- pnpm (recomendado) ou npm

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Christie-Cardoso/portal-camara.git
cd portal-camara
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz com suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=seu_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

4. Inicie o ambiente de desenvolvimento:
```bash
pnpm dev
```

---

## 🎨 Padrões de Design e UX

- **Smart Search Component**: Implementação de busca com *debounce* de 500ms e gatilho a partir do 3º caractere.
- **Skeleton Loading**: Telas de carregamento preditivas para melhor percepção de performance.
- **Responsive-First**: Interface otimizada para Desktop, Tablets e Mobile.
- **Graceful Degradation**: O sistema permanece funcional mesmo em instabilidades das APIs de terceiros.

---

## 📜 Licença

Este projeto é desenvolvido para fins informativos e utiliza dados públicos sob a **Lei de Acesso à Informação (LAI)**.

---
*Desenvolvido com ❤️ para a transparência pública brasileira.*
