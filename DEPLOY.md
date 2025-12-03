# 🚀 Guia de Deploy - Gomes & Noronha

Este guia detalha o processo de deploy dos dois projetos na Vercel.

---

## 📋 Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Conta no [GitHub](https://github.com)
3. Repositórios criados:
   - ✅ `gomes-noronha-imobiliaria` (Site) - já existe
   - ⏳ `gomes-noronha-crm` (CRM) - criar no GitHub

---

## 🔧 PASSO 1: Criar Repositório do CRM no GitHub

### Via Terminal:
```bash
cd /home/noronha/projetos/gomes-noronha-crm

# Criar repositório no GitHub (requer GitHub CLI)
gh repo create gomes-noronha-crm --private --source=. --push

# OU manualmente: criar repo no GitHub e depois:
git remote add origin https://github.com/Noronhajr13/gomes-noronha-crm.git
git push -u origin main
```

### Via GitHub Web:
1. Acesse https://github.com/new
2. Nome: `gomes-noronha-crm`
3. Visibilidade: **Private** (recomendado)
4. Não inicialize com README
5. Copie o URL do repositório

---

## 🔧 PASSO 2: Push do Site para GitHub

```bash
cd /home/noronha/projetos/gomes-noronha-imobiliaria
git push origin main
```

---

## ☁️ PASSO 3: Deploy do CRM na Vercel

### 3.1 Importar Projeto
1. Acesse https://vercel.com/new
2. Selecione "Import Git Repository"
3. Escolha `gomes-noronha-crm`
4. Clique em "Import"

### 3.2 Configurar Build
- **Framework Preset:** Next.js
- **Build Command:** `prisma generate && next build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 3.3 Configurar Variáveis de Ambiente
Adicione as seguintes variáveis:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `prisma+postgres://accelerate.prisma-data.net/?api_key=SEU_API_KEY` |
| `NEXTAUTH_URL` | `https://seu-dominio-crm.vercel.app` (atualize após deploy) |
| `NEXTAUTH_SECRET` | Gere com: `openssl rand -base64 32` |
| `SITE_URL` | `https://gomesnoronha.com.br` |

### 3.4 Deploy
1. Clique em "Deploy"
2. Aguarde o build (2-3 minutos)
3. Anote a URL gerada (ex: `gomes-noronha-crm.vercel.app`)

### 3.5 Atualizar NEXTAUTH_URL
1. Vá em Settings > Environment Variables
2. Edite `NEXTAUTH_URL` com a URL real do deploy
3. Faça Redeploy

---

## ☁️ PASSO 4: Deploy do Site na Vercel

### 4.1 Importar Projeto
1. Acesse https://vercel.com/new
2. Selecione "Import Git Repository"
3. Escolha `gomes-noronha-imobiliaria`
4. Clique em "Import"

### 4.2 Configurar Build
- **Framework Preset:** Next.js (detectado automaticamente)
- **Build Command:** `next build`
- **Output Directory:** `.next`

### 4.3 Configurar Variáveis de Ambiente
| Variável | Valor |
|----------|-------|
| `NEXT_PUBLIC_CRM_API_URL` | `https://gomes-noronha-crm.vercel.app/api` |

### 4.4 Deploy
1. Clique em "Deploy"
2. Aguarde o build
3. Anote a URL gerada

---

## 🌐 PASSO 5: Configurar Domínios (Opcional)

### Para o Site (gomesnoronha.com.br):
1. Vercel > Projeto Site > Settings > Domains
2. Adicione: `gomesnoronha.com.br` e `www.gomesnoronha.com.br`
3. Configure DNS no seu provedor:
   ```
   Tipo: CNAME
   Nome: @
   Valor: cname.vercel-dns.com
   
   Tipo: CNAME
   Nome: www
   Valor: cname.vercel-dns.com
   ```

### Para o CRM (crm.gomesnoronha.com.br):
1. Vercel > Projeto CRM > Settings > Domains
2. Adicione: `crm.gomesnoronha.com.br`
3. Configure DNS:
   ```
   Tipo: CNAME
   Nome: crm
   Valor: cname.vercel-dns.com
   ```

### Após configurar domínios, atualize:
1. **CRM:** `NEXTAUTH_URL=https://crm.gomesnoronha.com.br`
2. **CRM:** `SITE_URL=https://gomesnoronha.com.br`
3. **Site:** `NEXT_PUBLIC_CRM_API_URL=https://crm.gomesnoronha.com.br/api`

---

## ✅ PASSO 6: Testar Deploy

### Testar CRM:
1. Acesse: `https://[seu-crm-url]/login`
2. Login: `admin@gomesnoronha.com.br` / `admin123`
3. Verifique o Dashboard

### Testar Site:
1. Acesse: `https://[seu-site-url]`
2. Verifique se os imóveis carregam (da API do CRM)
3. Teste o formulário de contato

### Testar API:
```bash
# Listar imóveis
curl https://[seu-crm-url]/api/properties

# Criar lead (simulando formulário)
curl -X POST https://[seu-crm-url]/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","phone":"11999999999","source":"SITE"}'
```

---

## 🔒 Segurança Pós-Deploy

### 1. Alterar Senhas dos Usuários
Acesse o Dashboard do CRM e altere as senhas padrão.

### 2. Regenerar NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Atualize na Vercel e faça redeploy.

### 3. Configurar Rate Limiting (Futuro)
Considere adicionar rate limiting na API para prevenir abusos.

---

## 📊 Monitoramento

### Vercel Analytics
- Ative em: Project Settings > Analytics
- Gratuito para projetos Hobby

### Logs
- Vercel > Project > Deployments > Functions
- Veja logs em tempo real

---

## 🆘 Troubleshooting

### Erro de CORS
- Verifique se `SITE_URL` no CRM está correto
- Verifique o middleware.ts

### Erro de Database
- Verifique `DATABASE_URL`
- Execute: `npx prisma generate` localmente

### Erro de Auth
- Verifique `NEXTAUTH_URL` e `NEXTAUTH_SECRET`
- Limpe cookies do navegador

### Build falhou
- Verifique logs no Vercel
- Teste build local: `npm run build`

---

## 📝 Comandos Úteis

```bash
# Gerar secret seguro
openssl rand -base64 32

# Testar build local
npm run build

# Ver logs do Vercel
vercel logs [deployment-url]

# Redeploy
vercel --prod
```

---

*Guia criado em 02/12/2025*
