# Gomes & Noronha CRM

Sistema de CRM (Customer Relationship Management) para a imobiliária Gomes & Noronha.

## Funcionalidades

- 🏠 **Gestão de Imóveis**: Cadastro completo de imóveis com fotos, vídeos e detalhes
- 👥 **Gestão de Leads**: Acompanhamento de leads desde o primeiro contato até a venda
- 📅 **Agendamento de Visitas**: Controle de visitas e retornos
- ✅ **Tarefas**: Sistema de tarefas com prioridades e prazos
- 📊 **Dashboard**: Visão geral de métricas e indicadores
- 👤 **Multi-usuário**: Suporte para corretores, despachantes e administradores

## Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **NextAuth** - Autenticação
- **Tailwind CSS** - Estilização
- **React Hook Form + Zod** - Formulários e validação
- **TanStack Query** - Gerenciamento de estado e cache

## Pré-requisitos

- Node.js 18+
- PostgreSQL (local ou na nuvem)

## Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd gomes-noronha-crm
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Execute as migrações do banco:
```bash
npm run db:push
```

5. (Opcional) Popule o banco com dados de exemplo:
```bash
npm run db:seed
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O CRM estará disponível em http://localhost:3001

## Configuração do Banco de Dados

### Opção 1: Docker (recomendado)
```bash
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=gomes_noronha_crm \
  --name gomes-noronha-db \
  postgres:16-alpine
```

### Opção 2: Prisma Postgres (nuvem)
Crie um banco em console.prisma.io e atualize a DATABASE_URL.

### Opção 3: PostgreSQL local
Instale o PostgreSQL e crie um banco chamado `gomes_noronha_crm`.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run start` - Inicia em produção
- `npm run lint` - Verifica o código
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:push` - Sincroniza o schema com o banco
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Abre o Prisma Studio
- `npm run db:seed` - Popula o banco com dados de exemplo

## Estrutura de Pastas

```
src/
├── app/                  # Páginas (App Router)
│   ├── api/             # API Routes
│   ├── dashboard/       # Dashboard principal
│   ├── imoveis/         # Gestão de imóveis
│   ├── leads/           # Gestão de leads
│   ├── tarefas/         # Gestão de tarefas
│   └── login/           # Página de login
├── components/          # Componentes React
│   └── ui/              # Componentes base (button, input, etc)
├── lib/                 # Utilitários e configurações
│   ├── auth.ts          # Configuração NextAuth
│   ├── prisma.ts        # Cliente Prisma
│   └── utils.ts         # Funções auxiliares
└── types/               # Tipos TypeScript
```

## Usuários de Teste

Após executar o seed, estarão disponíveis:

| Email | Senha | Cargo |
|-------|-------|-------|
| admin@gomesnoronha.com.br | admin123 | Administrador |
| wesley@gomesnoronha.com.br | wesley123 | Corretor |
| claudio@gomesnoronha.com.br | claudio123 | Despachante |

## API

O CRM expõe APIs RESTful para integração com o site:

- `GET /api/properties` - Lista imóveis (público)
- `GET /api/properties/:id` - Detalhes do imóvel (público)
- `POST /api/leads` - Cria lead (público - para formulários do site)

APIs protegidas (requerem autenticação):
- `POST /api/properties` - Cria imóvel
- `PUT /api/properties/:id` - Atualiza imóvel
- `DELETE /api/properties/:id` - Remove imóvel
- `GET /api/leads` - Lista leads
- `PUT /api/leads/:id` - Atualiza lead
- `DELETE /api/leads/:id` - Remove lead

## Licença

Privado - Gomes & Noronha Imobiliária
