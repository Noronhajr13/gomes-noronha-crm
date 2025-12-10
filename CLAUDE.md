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
- **Heroicons** - Ícones
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
│   │   └── novo/                # Cadastro
│   ├── dashboard/               # Dashboard com métricas
│   ├── imoveis/                 # Páginas de imóveis
│   │   ├── [id]/                # Detalhes e edição
│   │   └── novo/                # Cadastro
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

❗**Regra**: Usar `@heroicons/react/24/outline` para ícones.

❗**Regra**: Sempre registrar Activity quando houver mudanças em leads (status, criação, etc.).

❗**Regra**: Executar `npm run build` para validar antes de commit.

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
| Tarefas | 🔄 | API pronta, UI pendente |
| Configurações | ❌ | Pendente |

---

## Próximos Passos

1. [ ] Página de Tarefas/Agenda (`/tarefas`)
2. [ ] Kanban visual para atendimentos
3. [ ] Upload de imagens (integrar storage)
4. [ ] Exportar CSV/Excel
5. [ ] Página de Configurações
6. [ ] Gestão de Usuários

---

*Atualizado em: 09/12/2025*
