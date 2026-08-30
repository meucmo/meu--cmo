# 🚀 Meu CMO

**Plataforma SaaS de assinatura onde uma IA atua como gerente de marketing (CMO) diário para pequenos negócios locais e profissionais/clínicas de saúde.**

O Meu CMO gera um plano de marketing completo todos os dias — com roteiros de vídeo para Stories, Reels e Feed, ação comercial, meta do dia e checklist — além de um chat com a IA (o "CMO") que ajuda o cliente a executar. Tem modo Saúde com regras éticas (educação > confiança > posicionamento), banco de ideias, histórico com exportação CSV, painel admin com métricas e é um PWA instalável.

---

## 🧱 Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React + Vite + Tailwind CSS (PWA) |
| **Backend** | Express.js 5 (API + gateway) |
| **Banco / Auth** | PocketBase + SQLite |
| **IA** | Integrated AI (plataforma Hostinger) |
| **Pagamentos** | Subscriptions infrastructure (3 planos recorrentes) |

---

## 📦 Estrutura do monorepo

```
.
├── apps/
│   ├── web/          # Frontend React + Vite (porta 3000)
│   ├── api/          # API Express (porta 3001)
│   └── pocketbase/   # PocketBase: migrations, hooks, binário (porta 8090)
├── vault/            # Wiki e documentação de skills (referência)
├── package.json      # Scripts raiz (dev / build / start)
├── railway.json      # Config de deploy no Railway
├── Procfile          # Alternativa de start para Railway
├── .env.example      # Modelo de variáveis de ambiente
├── README.md         # Este arquivo
└── SETUP.md          # Passo a passo para enviar ao GitHub
```

---

## 💳 Planos

| Plano | Preço | Público |
|-------|-------|---------|
| **Empresa** | R$59/mês | Pequenos negócios locais |
| **Pro Empresa** | R$97/mês | Crescimento acelerado |
| **Saúde** | R$397/mês | Profissionais e clínicas de saúde |

---

## ✨ Funcionalidades

- **Onboarding conversacional** — fluxo de 9 passos (nome do assistente → segmento → dados da empresa → primeiro plano)
- **Plano de marketing diário** com formato completo (Objetivo, Briefing, Stories, Reels, Post de Feed, Ação Comercial, Ação Extra, Meta do Dia, Checklist) e roteiro de vídeo cena a cena (Gancho → Desenvolvimento → Entrega de Valor → CTA)
- **Modo Saúde** com regras éticas (educação primeiro, sem promessa de cura, sem sensacionalismo)
- **Chat com a IA (CMO)** com limites por plano
- **Banco de Ideias** — salvar, buscar, filtrar e reutilizar ideias no chat
- **Histórico** com busca por palavra-chave e exportação CSV
- **Painel admin** com métricas (MRR, churn, evolução, clientes por plano)
- **PWA instalável** (Android/iOS) com service worker e ícones maskable
- **Páginas SaaS** — landing, pricing, termos, privacidade (LGPD)
- **Notificações por e-mail** (boas-vindas, "plano pronto") via hooks do PocketBase

---

## 🛠️ Desenvolvimento local

### Pré-requisitos
- Node.js 22+
- npm 10+

### Rodar

```bash
npm install        # instala dependências de todos os workspaces
npm run dev        # sobe web (3000) + api (3001) + pocketbase (8090)
```

Serviços:
- **Web:** http://localhost:3000
- **API:** http://localhost:3001
- **PocketBase:** http://localhost:8090

### Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste (principalmente `PB_ENCRYPTION_KEY` e as credenciais do superusuário):

```bash
cp .env.example .env
```

> ⚠️ **Nunca altere `PB_ENCRYPTION_KEY` depois de criar dados** — os arquivos do banco ficam ligados a essa chave.

---

## 🚀 Deploy

### Opção 1 — Hostinger AI Builder (recomendado)
Publique pelo painel da plataforma. As migrations rodam automaticamente, domínio e SSL são configurados sozinhos.

### Opção 2 — Railway
Veja o passo a passo completo em **`RAILWAY_DEPLOY.md`** e o guia de envio ao GitHub em **`SETUP.md`**.

> **Limitação no Railway:** a geração de planos por IA e o checkout de assinaturas usam APIs internas da Hostinger. Fora da plataforma esses recursos precisam de provedores próprios (OpenAI, Stripe) — veja `RAILWAY_DEPLOY.md`.

---

## 📚 Documentação

- **`SETUP.md`** — como versionar e enviar o código para o GitHub
- **`RAILWAY_DEPLOY.md`** — deploy completo no Railway
- **`.env.example`** — todas as variáveis de ambiente documentadas
- **`vault/wiki/`** — wiki do projeto e skills de referência

---

## 📄 Licença

Projeto privado. Todos os direitos reservados.
