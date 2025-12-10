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
│   │   ├── dashboard/           # API métricas
│   │   ├── leads/               # API leads CRUD
│   │   ├── properties/          # API imóveis CRUD
│   │   └── tasks/               # API tarefas CRUD
│   ├── atendimentos/            # Páginas de leads/atendimentos
│   │   ├── [id]/                # Detalhes e edição
│   │   ├── novo/                # Cadastro
│   │   └── KanbanBoard.tsx      # Visualização Kanban
│   ├── dashboard/               # Dashboard com métricas
│   ├── imoveis/                 # Páginas de imóveis
│   │   ├── [id]/                # Detalhes e edição
│   │   └── novo/                # Cadastro
│   ├── tarefas/                 # Gestão de tarefas
│   └── login/                   # Página de login
├── components/
│   └── layout/
│       ├── CRMLayout.tsx        # Layout principal
│       ├── Sidebar.tsx          # Menu lateral
│       └── TopBar.tsx           # Barra superior
├── lib/
│   ├── auth.ts                  # Configuração NextAuth
│   └── prisma.ts                # Cliente Prisma
└── middleware.ts                # Proteção de rotas
```

---

## Schemas Prisma (Modelos)

### Principais Enums
```prisma
// Tipos de Imóvel
PropertyType: CASA, APARTAMENTO, TERRENO, COMERCIAL, RURAL, GALPAO, KITNET, COBERTURA, SOBRADO

// Transação
TransactionType: VENDA, ALUGUEL, VENDA_ALUGUEL

// Status do Imóvel
PropertyStatus: DISPONIVEL, RESERVADO, VENDIDO, ALUGADO, INATIVO

// Origem do Lead
LeadSource: SITE, WHATSAPP, INDICACAO, PORTAL_ZAP, PORTAL_VIVAREAL, PORTAL_OLX, REDES_SOCIAIS, TELEFONE, VISITA_ESCRITORIO, OUTRO

// Status do Lead
LeadStatus: NOVO, CONTATO_REALIZADO, QUALIFICADO, VISITA_AGENDADA, PROPOSTA_ENVIADA, NEGOCIACAO, FECHADO_GANHO, FECHADO_PERDIDO

// Prioridade de Tarefa
TaskPriority: BAIXA, MEDIA, ALTA, URGENTE

// Status de Tarefa
TaskStatus: PENDENTE, EM_ANDAMENTO, CONCLUIDA, CANCELADA

// Tipo de Tarefa
TaskType: GERAL, LIGACAO, VISITA, DOCUMENTACAO, CONTRATO, FINANCEIRO, FOLLOW_UP
```

### Campos Importantes (Property)
- `transactionType` (não "transaction")
- `condominiumFee` (não "condoFee")
- `parking` (não "parkingSpaces")
- `addressNumber` (não "number")

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
| Relatórios | ❌ | `/relatorios` (pendente) |
| Documentos | ❌ | `/documentos` (pendente) |
| Configurações | ❌ | `/configuracoes` (pendente) |

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
- Galeria de imagens (estrutura preparada)

---

## Próximos Passos

1. [x] Página de Tarefas (`/tarefas`) ✅
2. [x] Kanban visual para atendimentos ✅
3. [x] Página de Leads dedicada (`/leads`) ✅
4. [ ] Upload de imagens (integrar storage)
5. [ ] Exportar CSV/Excel
6. [ ] Página de Relatórios (`/relatorios`)
7. [ ] Página de Documentos (`/documentos`)
8. [ ] Página de Configurações (`/configuracoes`)
9. [ ] Gestão de Usuários

---

*Atualizado em: 09/12/2025*
