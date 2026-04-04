# Plano de Implementação: Secretários Parlamentares (Opção 2 - Supabase)

O objetivo desta tarefa é substituir o conteúdo estático da aba "Assessores" pelos dados reais dos Secretários Parlamentares vinculados ao gabinete de cada deputado, utilizando a infraestrutura do **Supabase (PostgreSQL)** para armazenamento e consulta rápida.

## 🛠️ Arquitetura Escolhida

Optamos pela **Opção 2: Supabase + Carga do Arquivo Oficial da Câmara**. Esta abordagem é mais robusta que o scraping, pois utiliza os dados oficiais da Câmara processados em lote, garantindo performance e estabilidade.

---

## 📅 Passos para Implementação

### 1. Configuração do Banco de Dados (PostgreSQL no Supabase)
O primeiro passo é preparar o ambiente SQL no seu painel da Supabase.

**Ação:** Execute o seguinte comando no **SQL Editor** do Supabase:

```sql
-- Criar a tabela de secretários
CREATE TABLE secretarios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ponto TEXT UNIQUE, -- Identificador único (Matrícula)
  nome TEXT NOT NULL,
  id_legislatura INT,
  cargo TEXT,
  lotacao TEXT, -- E.g., "Gabinete Nikolas Ferreira"
  situacao TEXT, -- E.g., "Em exercício"
  sigla_uf TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index para buscas rápidas (Gabinete)
CREATE INDEX idx_secretarios_lotacao ON secretarios (lotacao);
```

### 2. Configuração de Ambiente (.env.local)
Utilizaremos as seguintes chaves no projeto para a conexão via `@supabase/supabase-js`:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://ggzxxqznlxuitponpszw.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `sb_publishable_e62vCKPcvg1azcUHtZKhnw_2nHmnqIQ`

### 3. Script de Sincronização (ETL)
Criaremos um script `scripts/sync-secretarios.mjs` que realizará o seguinte processo:
- **Download:** Baixa o arquivo oficial `funcionarios.csv` (~60MB).
- **Processamento:** Lê o arquivo via streaming (para economizar memória RAM).
- **Filtro:** Separa apenas funcionários com cargo "Secretário Parlamentar".
- **Sincronização:** Envia os dados para o Supabase usando `UPSERT` (insere novos ou atualiza existentes).

### 4. Integração no Front-end
Atualizaremos a página `src/app/deputados/[id]/page.tsx` para:
- Detectar o nome do gabinete do deputado atual.
- Consultar a tabela `secretarios` no Supabase via `ilike` (busca insensível a maiúsculas/minúsculas).
- Exibir a lista real de funcionários na aba "Resumo".

---

## ✅ Plano de Verificação

1. **Local:** Executar o script de sincronização e validar se os dados apareceram no dashboard do Supabase.
2. **Interface:** Abrir o perfil de um deputado e verificar se a lista de assessores reflete os dados reais do banco.
