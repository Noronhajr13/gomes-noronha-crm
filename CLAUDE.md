# CLAUDE.md - CRM Gomes & Noronha

## Visão Geral do Projeto

Este é o **CRM (Customer Relationship Management)** da imobiliária Gomes & Noronha.
Sistema privado para gestão interna de imóveis, leads/atendimentos, tarefas e operações.

**Repositório:** https://github.com/Noronhajr13/gomes-noronha-crm
**Framework:** Next.js 14.2.15 (App Router)
**Banco de Dados:** Prisma + PostgreSQL (Prisma Postgres Cloud)
**Autenticação:** NextAuth.js com credenciais

---

## Stack Tecnológica

- **Next.js 14** - App Router
- **TypeScript** - Tipagem estática
- **Prisma 5.22** - ORM
- **NextAuth 4.24** - Autenticação
- **Tailwind CSS** - Estilização
- **Lucide React** - Ícones
- **Bcryptjs** - Hash de senhas

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Autenticação
│   │   ├── configurations/      # API configurações CRUD
│   │   ├── dashboard/           # API métricas
│   │   ├── documents/           # API documentos CRUD
│   │   ├── leads/               # API leads CRUD
│   │   ├── properties/          # API imóveis CRUD
│   │   ├── reports/             # API relatórios
│   │   └── tasks/               # API tarefas CRUD
│   ├── atendimentos/            # Páginas de leads/atendimentos
│   │   ├── [id]/                # Detalhes e edição
│   │   ├── novo/                # Cadastro
│   │   └── KanbanBoard.tsx      # Visualização Kanban
│   ├── configuracoes/           # Configurações do sistema
│   ├── dashboard/               # Dashboard com métricas
│   ├── documentos/              # Gestão de documentos
│   ├── imoveis/                 # Páginas de imóveis
│   │   ├── [id]/                # Detalhes e edição
│   │   └── novo/                # Cadastro
│   ├── leads/                   # Página de leads
│   ├── relatorios/              # Relatórios e análises
│   ├── tarefas/                 # Gestão de tarefas
│   └── login/                   # Página de login
├── components/
│   ├── layout/
│   │   ├── CRMLayout.tsx        # Layout principal
│   │   ├── Sidebar.tsx          # Menu lateral
│   │   └── TopBar.tsx           # Barra superior
│   └── ui/
│       ├── form-elements.tsx    # Componentes de formulário
│       └── image-upload.tsx     # Upload de imagens
├── lib/
│   ├── auth.ts                  # Configuração NextAuth
│   ├── prisma.ts                # Cliente Prisma
│   └── supabase.ts              # Cliente Supabase
└── middleware.ts                # Proteção de rotas
```

---

## Schemas Prisma (Modelos)

### Principais Enums
```prisma
// Tipos de Imóvel
PropertyType: CASA, APARTAMENTO, TERRENO, COMERCIAL, RURAL, COBERTURA, KITNET, SOBRADO, SALA_COMERCIAL, LOJA, GALPAO, SITIO, FAZENDA, FLAT

// Transação
TransactionType: VENDA, ALUGUEL, VENDA_ALUGUEL

// Status do Imóvel
PropertyStatus: DISPONIVEL, RESERVADO, VENDIDO, ALUGADO, INATIVO

// Origem do Lead
LeadSource: SITE, TELEFONE, INDICACAO, FACEBOOK, INSTAGRAM, WHATSAPP, PORTAIS, PORTAL_ZAP, PORTAL_VIVAREAL, PORTAL_OLX, REDES_SOCIAIS, VISITA_ESCRITORIO, OUTRO

// Status do Lead
LeadStatus: NOVO, CONTATO_REALIZADO, QUALIFICADO, VISITA_AGENDADA, PROPOSTA_ENVIADA, NEGOCIACAO, FECHADO_GANHO, FECHADO_PERDIDO

// Prioridade de Tarefa
TaskPriority: BAIXA, MEDIA, ALTA, URGENTE

// Status de Tarefa
TaskStatus: PENDENTE, EM_ANDAMENTO, CONCLUIDA, CANCELADA

// Tipo de Tarefa
TaskType: GERAL, LIGACAO, VISITA, DOCUMENTACAO, CONTRATO, FINANCEIRO, FOLLOW_UP

// Tipo de Documento
DocumentType: CONTRATO, PROPOSTA, RG, CPF, COMPROVANTE_RESIDENCIA, COMPROVANTE_RENDA, ESCRITURA, IPTU, MATRICULA, CERTIDAO, LAUDO, FOTO, OUTROS

// Tipo de Configuração
ConfigType: STRING, NUMBER, BOOLEAN, JSON
```

### Campos Importantes (Property)
- `purpose` - No schema Prisma (PropertyPurpose: VENDA, ALUGUEL, VENDA_ALUGUEL)
- `transactionType` - No frontend (a API converte para `purpose` ao salvar)
- `condominiumFee` - Taxa de condomínio (Float?)
- `iptu` - Valor do IPTU (Float?)
- `suites` - Número de suítes (Int?)
- `yearBuilt` - Ano de construção (Int?)
- `addressNumber` - Número do endereço (String?)
- `complement` - Complemento do endereço (String?)
- `videos` - URLs de vídeos (String[])

### Campos Importantes (Task)
- `status` - TaskStatus: PENDENTE, EM_ANDAMENTO, CONCLUIDA, CANCELADA
- `type` - TaskType: GERAL, LIGACAO, VISITA, DOCUMENTACAO, CONTRATO, FINANCEIRO, FOLLOW_UP
- `priority` - TaskPriority: BAIXA, MEDIA, ALTA, URGENTE
- `completed` - Boolean (mantido para retrocompatibilidade)

---

## Credenciais de Acesso

**Login:** admin@gomesnoronha.com.br  
**Senha:** admin123

---

## Regras de Desenvolvimento

### IMPORTANTE

- Sempre responda em português;
- Mantenha o contexto da conversa atual;
- Siga as regras e padrões estabelecidos neste arquivo;
- **NUNCA usar Python** - Este é um projeto Next.js/TypeScript;

### Regras Gerais

❗**Regra**: Sempre usar Prisma Client via `@/lib/prisma` para acesso ao banco.

❗**Regra**: Todas as páginas protegidas devem verificar sessão com `getServerSession(authOptions)`.

❗**Regra**: Usar o padrão de Server Component + Client Component:
- `page.tsx` = Server Component (busca dados, verifica auth)
- `*Content.tsx` = Client Component (interatividade, forms)

❗**Regra**: Props de usuário devem usar `role?: string` (opcional) para evitar erros de tipo.

❗**Regra**: Usar nomes de campos do Prisma schema, não inventar nomes:
- ✅ `transactionType`, `condominiumFee`, `parking`, `addressNumber`
- ❌ `transaction`, `condoFee`, `parkingSpaces`, `number`

❗**Regra**: Enums em português conforme schema Prisma (CASA, VENDA, DISPONIVEL, etc.).

❗**Regra**: Sempre passar prop `title` obrigatória para `CRMLayout`.

❗**Regra**: APIs devem retornar erros estruturados: `{ error: string }` com status HTTP correto.

❗**Regra**: Usar `lucide-react` para ícones.

❗**Regra**: Sempre registrar Activity quando houver mudanças em leads (status, criação, etc.).

❗**Regra**: Executar `npm run build` para validar antes de commit.

❗**Regra**: Usar `sed` ou ferramentas de terminal para edições em arquivos quando necessário, nunca Python.

---

## Comandos

```bash
# Desenvolvimento
npm run dev          # Inicia servidor (porta 3001)

# Build
npm run build        # Compila para produção

# Banco de Dados
npx prisma studio    # Interface visual do banco
npx prisma migrate dev --name "descricao"  # Nova migration
npx prisma generate  # Regenera cliente após mudanças no schema

# Git
git add . && git commit -m "feat: descricao" && git push
```

---

## Módulos Implementados

| Módulo | Status | Rotas |
|--------|--------|-------|
| Autenticação | ✅ | `/login`, `/api/auth/*` |
| Dashboard | ✅ | `/dashboard` |
| Imóveis | ✅ | `/imoveis`, `/imoveis/novo`, `/imoveis/[id]`, `/imoveis/[id]/editar` |
| Atendimentos | ✅ | `/atendimentos`, `/atendimentos/novo`, `/atendimentos/[id]`, `/atendimentos/[id]/editar` |
| Kanban | ✅ | Toggle em `/atendimentos` (Lista/Kanban) |
| Tarefas | ✅ | `/tarefas` (lista, filtros, CRUD modal) |
| Leads | ✅ | `/leads` (lista, filtros, export CSV, stats) |
| Relatórios | ✅ | `/relatorios` (geral, vendas, leads, performance) |
| Documentos | ✅ | `/documentos` (upload, listagem, CRUD) |
| Configurações | ✅ | `/configuracoes` (sistema, por categoria, CRUD) |

---

## Funcionalidades por Módulo

### Atendimentos (Leads)
- Lista com busca e filtros (origem, status)
- Toggle Lista/Kanban
- Kanban Board com 8 colunas de status
- Arrastar cards para mudar status (PATCH API)
- CRUD completo (criar, visualizar, editar)
- Tabs: Histórico, Visitas, Tarefas

### Tarefas
- Lista com filtros (status, prioridade, tipo)
- Filtro por período (hoje, semana, mês, etc.)
- Modal para criar/editar tarefas
- Stats cards (pendentes, concluídas, atrasadas)
- Vinculação com leads e imóveis

### Imóveis
- Lista com grid/lista views
- Filtros avançados
- CRUD completo
- Galeria de imagens com upload (Supabase Storage)

### Relatórios
- Relatório Geral (métricas de imóveis, leads, tarefas, visitas)
- Relatório de Vendas (imóveis vendidos, valores, ticket médio)
- Relatório de Leads (distribuição por status e origem)
- Relatório de Performance (estatísticas por usuário/corretor)
- Filtros por período (data início/fim)
- Export CSV para todos os relatórios

### Documentos
- Upload de documentos com drag & drop
- Tipos: Contrato, Proposta, RG, CPF, Comprovantes, Escritura, IPTU, etc.
- Filtros por tipo e busca por título/nome
- Visualização em grid com cards
- Download, edição e exclusão
- Tags personalizadas
- Vinculação com leads e imóveis (estrutura preparada)

### Configurações
- Organização por categorias (Geral, Notificações, E-mail, Financeiro, Segurança, Integrações)
- CRUD de configurações (chave/valor)
- Tipos de dados: String, Number, Boolean, JSON
- Acesso restrito a usuários ADMIN
- Interface com tabs para navegação entre categorias

---

## Próximos Passos

1. [x] Página de Tarefas (`/tarefas`) ✅
2. [x] Kanban visual para atendimentos ✅
3. [x] Página de Leads dedicada (`/leads`) ✅
4. [x] Upload de imagens (Supabase Storage) ✅
5. [x] Página de Relatórios (`/relatorios`) ✅
6. [x] Página de Documentos (`/documentos`) ✅
7. [x] Página de Configurações (`/configuracoes`) ✅
8. [ ] Integração completa Supabase Storage para documentos
9. [ ] Gestão de Usuários (`/usuarios`)
10. [ ] Dashboard com gráficos (Recharts)
11. [ ] Notificações em tempo real
12. [ ] Histórico de atividades detalhado

---

## Upload de Imagens (Supabase Storage)

### Configuração

O sistema utiliza **Supabase Storage** para armazenar as imagens dos imóveis.

**Variáveis de ambiente necessárias:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Estrutura de Arquivos

```
src/lib/supabase.ts           # Cliente Supabase e funções de upload
src/components/ui/image-upload.tsx  # Componente de upload com drag & drop
```

### Bucket do Supabase

**Nome do bucket:** `property-images`

⚠️ **IMPORTANTE:** É necessário criar o bucket manualmente no Supabase Dashboard:
1. Acesse https://supabase.com/dashboard/project/orcnbzjdjezqddwkeyxl/storage
2. Clique em "New Bucket"
3. Nome: `property-images`
4. Marque "Public bucket" para permitir acesso público às imagens
5. Clique em "Create bucket"

### Políticas de Segurança (RLS)

Após criar o bucket, configure as políticas:
```sql
-- Permitir upload autenticado ou anônimo (para desenvolvimento)
CREATE POLICY "Allow uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'property-images');

-- Permitir leitura pública
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (bucket_id = 'property-images');

-- Permitir deleção
CREATE POLICY "Allow deletes" ON storage.objects
FOR DELETE USING (bucket_id = 'property-images');
```

### Uso do Componente ImageUpload

```tsx
import { ImageUpload } from '@/components/ui/image-upload'

<ImageUpload
  propertyCode="imovel-123"  // Código único para organizar no storage
  images={images}            // Array de URLs das imagens
  onChange={setImages}       // Callback quando imagens mudam
  maxImages={20}             // Limite de imagens (opcional, padrão: 20)
/>
```

### Funções Disponíveis (lib/supabase.ts)

```typescript
// Upload de imagem
uploadPropertyImage(file: File, propertyCode: string): Promise<{ url: string; error: string | null }>

// Deletar imagem
deletePropertyImage(imageUrl: string): Promise<{ success: boolean; error: string | null }>

// Listar imagens de um imóvel
listPropertyImages(propertyCode: string): Promise<{ urls: string[]; error: string | null }>
```

### Características do Componente

- ✅ Drag & drop de múltiplas imagens
- ✅ Preview das imagens com miniatura
- ✅ Barra de progresso durante upload
- ✅ Limite de tamanho (5MB por arquivo)
- ✅ Primeira imagem marcada como "Principal"
- ✅ Botão de exclusão por imagem
- ✅ Validação de tipos de arquivo (PNG, JPG, WEBP)

---

## Novos Modelos Prisma

### Document (Documentos)

Modelo para gerenciar documentos e arquivos do CRM.

**Campos principais:**
- `title` - Título do documento
- `description` - Descrição opcional
- `type` - Tipo do documento (DocumentType enum)
- `category` - Categoria personalizada
- `fileUrl` - URL do arquivo
- `fileName` - Nome original do arquivo
- `fileSize` - Tamanho em bytes
- `mimeType` - Tipo MIME do arquivo
- `tags` - Array de tags para busca
- `leadId` - Vinculação com lead (opcional)
- `propertyId` - Vinculação com imóvel (opcional)
- `userId` - Usuário que fez upload

**Tipos de documento:**
- CONTRATO, PROPOSTA, RG, CPF, COMPROVANTE_RESIDENCIA, COMPROVANTE_RENDA
- ESCRITURA, IPTU, MATRICULA, CERTIDAO, LAUDO, FOTO, OUTROS

### Configuration (Configurações)

Modelo para armazenar configurações do sistema.

**Campos principais:**
- `key` - Chave única da configuração
- `value` - Valor armazenado (sempre string)
- `type` - Tipo de dado (ConfigType: STRING, NUMBER, BOOLEAN, JSON)
- `category` - Categoria da configuração
- `label` - Nome amigável para exibição
- `description` - Descrição do que a configuração faz

**Categorias sugeridas:**
- `geral` - Configurações gerais do sistema
- `notificacoes` - Configurações de notificações
- `email` - Configurações de e-mail
- `financeiro` - Configurações financeiras
- `seguranca` - Configurações de segurança
- `integracao` - Configurações de integrações

---

## APIs Implementadas

| Endpoint | Métodos | Descrição |
|----------|---------|-----------|
| `/api/auth/[...nextauth]` | GET, POST | Autenticação NextAuth |
| `/api/configurations` | GET, POST | Listar e criar configurações |
| `/api/configurations/[id]` | PATCH, DELETE | Atualizar e deletar configuração |
| `/api/dashboard` | GET | Estatísticas do dashboard |
| `/api/documents` | GET, POST | Listar e criar documentos |
| `/api/documents/[id]` | PATCH, DELETE | Atualizar e deletar documento |
| `/api/leads` | GET, POST | Listar e criar leads |
| `/api/leads/[id]` | GET, PATCH, DELETE | Obter, atualizar e deletar lead |
| `/api/properties` | GET, POST | Listar e criar imóveis |
| `/api/properties/[id]` | GET, PATCH, DELETE | Obter, atualizar e deletar imóvel |
| `/api/reports` | GET | Gerar relatórios (geral, vendas, leads, performance) |
| `/api/tasks` | GET, POST | Listar e criar tarefas |
| `/api/tasks/[id]` | PATCH, DELETE | Atualizar e deletar tarefa |

**Parâmetros comuns:**
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 20)
- `search` - Busca por texto
- `status` - Filtro por status
- `type` - Filtro por tipo
- `startDate` / `endDate` - Filtros de data

---

*Atualizado em: 17/12/2025*
