# 🚀 MEU CMO — Deploy no Railway (passo a passo)

Guia direto para colocar o **Meu CMO** online no Railway em ~5 minutos.

> **Arquitetura no Railway:** um único serviço roda três processos no mesmo container:
> 1. **PocketBase** (banco + auth) — porta interna `8090`
> 2. **Express API** (gateway + IA/admin) — porta `$PORT` (pública)
> 3. O Express também **serve o build do site** (estático) e faz **proxy** do PocketBase em `/hcgi/platform`.
>
> O Railway envia todo o tráfego para a porta `$PORT`. O navegador acessa o site direto pela raiz (`/`), a API por `/hcgi/api/*` e o PocketBase por `/hcgi/platform/*` — tudo no mesmo domínio.

---

## ✅ Pré-requisitos

- Conta no [Railway](https://railway.app) (login com GitHub).
- Conta no [GitHub](https://github.com) com este repositório.
- O código deste projeto enviado para o GitHub (push).

---

## PASSO 1 — Enviar o projeto para o GitHub

Se ainda não versionou:

```bash
git init
git add .
git commit -m "Meu CMO pronto para Railway"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/meu-cmo.git
git push -u origin main
```

> Os arquivos `railway.json`, `Procfile` e `.env.example` já estão na raiz do projeto.

---

## PASSO 2 — Criar o serviço no Railway

1. Acesse **https://railway.app/new**
2. Clique em **Deploy from GitHub repo**.
3. Selecione o repositório `meu-cmo`.
4. (Opcional) Clique em **Settings** → renomeie o serviço para `meu-cmo`.

O Railway detecta o `railway.json` e o `Procfile` automaticamente.

---

## PASSO 3 — Criar um volume (persistência do banco)

O PocketBase grava dados em `apps/pocketbase/pb_data`. Sem volume, **os dados se perdem a cada redeploy**.

1. No serviço `meu-cmo`, aba **Settings** → **Volumes** → **Add Volume**.
2. **Mount path:** `apps/pocketbase/pb_data`
3. Salve.

---

## PASSO 4 — Configurar variáveis de ambiente

Aba **Variables** → **New Variable** (ou **Raw Editor** e cole o conteúdo do `.env.example` ajustado):

| Variável | Valor | Obrigatório? |
|---|---|---|
| `SERVE_WEB` | `true` | ✅ Sim |
| `NODE_ENV` | `production` | ✅ Sim |
| `PB_ENCRYPTION_KEY` | chave aleatória forte (ver abaixo) | ✅ Sim |
| `PB_SUPERUSER_EMAIL` | `admin@meucmo.com` | ✅ Sim |
| `PB_SUPERUSER_PASSWORD` | senha forte | ✅ Sim |
| `WEBSITE_DOMAIN` | `meu-cmo.up.railway.app` (seu domínio Railway, sem `https://`) | ✅ Sim |
| `POCKETBASE_INTERNAL_URL` | `http://localhost:8090` | ✅ Sim |
| `INTEGRATED_AI_API_URL` | *(ver nota abaixo)* | ❌ Opcional |
| `INTEGRATED_AI_API_KEY` | *(ver nota abaixo)* | ❌ Opcional |
| `ECOMMERCE_API_URL` / `ECOMMERCE_API_KEY` / `ECOMMERCE_STORE_ID` | *(ver nota abaixo)* | ❌ Opcional |

Gerar uma chave de encriptação (rode uma vez no seu terminal):

```bash
openssl rand -base64 32
```

> ⚠️ **Nunca altere `PB_ENCRYPTION_KEY` depois do primeiro deploy** — os dados do banco ficam ligados a ela.

---

## PASSO 5 — Gerar domínio público

1. Aba **Settings** → **Networking** → **Generate Domain**.
2. Você recebe algo como `meu-cmo.up.railway.app`.
3. Volte em **Variables** e ajuste `WEBSITE_DOMAIN` para esse domínio **sem `https://`**.

---

## PASSO 6 — Deploy 🎉

1. Aba **Deployments** → **Deploy latest commit** (ou faça um `git push`).
2. Acompanhe os logs em **Deployments** → clique no deploy.
   - Você verá: `API server listening on port 3001` e `Serving web build from .../dist/apps/web`.
3. Quando o healthcheck `/hcgi/api/health` ficar verde, o app está no ar.

Abra o domínio público no navegador → **o site carrega**.

---

## PASSO 7 — Primeiro acesso

- **Site público:** `https://meu-cmo.up.railway.app/`
- **Painel admin do PocketBase:** `https://meu-cmo.up.railway.app/hcgi/platform/_/`
  - Login com `PB_SUPERUSER_EMAIL` / `PB_SUPERUSER_PASSWORD`.
- **Criar conta de usuário:** clique em **Cadastrar** no site.

---

## ⚠️ Limitações importantes no Railway

Os recursos de **IA** (geração de planos diários, chat) e **assinaturas/checkout** usam APIs internas da plataforma Hostinger AI Builder, que **não estão disponíveis fora dela**.

| Recurso | Funciona no Railway? |
|---|---|
| Site público, landing, pricing, páginas legais | ✅ Sim |
| Cadastro / login / recuperação de senha | ✅ Sim |
| Onboarding conversacional | ✅ Sim |
| Dashboard, planos salvos, tarefas, histórico | ✅ Sim |
| Banco de Ideias | ✅ Sim |
| Painel admin (métricas) | ✅ Sim |
| PWA (instalável) | ✅ Sim |
| **Geração de planos por IA / chat com IA** | ❌ Só com `INTEGRATED_AI_API_URL` + `INTEGRATED_AI_API_KEY` compatíveis |
| **Checkout de assinaturas (pagamento)** | ❌ Só com `ECOMMERCE_*` compatíveis |

Para habilitar IA/assinaturas fora da Hostinger é preciso adaptar `apps/api/src/api/integrated-ai.js` e `apps/api/src/routes/ecommerce/subscriptions.js` para um provedor próprio (OpenAI, Stripe, etc.) — isso exige alteração de código.

---

## 🛠️ Comandos úteis

```bash
# Build local (testar antes do deploy)
npm install
npm run build --prefix apps/web

# Rodar tudo localmente (desenvolvimento)
npm run dev

# Ver logs no Railway
# Railway → serviço → Deployments → clique no deploy atual
```

---

## 🔁 Atualizações

Para nova versão: faça `git push` para a `main`. O Railway rebuilda e faz redeploy automaticamente. O volume mantém o banco intacto.

---

## 🧯 Problemas comuns

| Sintoma | Solução |
|---|---|
| Build falha | Confira que `npm install` roda na raiz; veja os logs do Nixpacks |
| Site branco / 404 | `SERVE_WEB=true` definido? Build do web gerou `dist/apps/web`? |
| Erro 401/403 na API | Usuário não logado ou e-mail não verificado — cadastre e verifique |
| `pocketbase: not found` | O binário `apps/pocketbase/pocketbase` precisa subir no repo (é Linux x86_64) |
| Dados somem após redeploy | Volume não montado em `apps/pocketbase/pb_data` (Passo 3) |
| IA não gera planos | `INTEGRATED_AI_API_URL`/`KEY` não configurados (ver Limitações) |

---

Pronto. Seu Meu CMO está online no Railway. 🎉
