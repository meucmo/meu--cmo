# Meu CMO — Codebase Map

Monorepo full-stack: web frontend (Vite + React), Express API gateway, PocketBase backend. Deployed on Railway with optional Hostinger reverse-proxy compatibility.

| Service | Language | Port | Purpose |
|---------|----------|------|---------|
| **apps/web** | React + Vite | 5173 | SPA: landing, auth, onboarding, dashboard, daily plans, chat, admin |
| **apps/api** | Node.js + Express | 3001 | API gateway: mounts `/hcgi/api/*` routes, proxies `/hcgi/platform/*` to PocketBase, optionally serves web build |
| **apps/pocketbase** | Go (binary) | 8090 | Database & auth: collections, migrations, hooks, email notifications |

## apps/web (React + Vite, port 5173)

Located at apps/web/. Run: `cd apps/web && npm run dev`.

src/pages/HomePage.jsx — landing page with hero, features, pricing, CTA
src/pages/LoginPage.jsx — email/password login form, session persistence
src/pages/SignupPage.jsx — email/password signup, company creation, onboarding redirect
src/pages/OnboardingPage.jsx — conversational company profile setup (nome_assistente, segmento, especialidade, objetivos, etc.), saves to empresas collection
src/pages/DashboardPage.jsx — main app: daily plan display, task checklist, chat sidebar, video roteiro, copy buttons
src/pages/HistoricoPage.jsx — past plans list, filter by date/type, view/regenerate
src/pages/ConfiguracoesPage.jsx — company settings, subscription info, logout
src/pages/PlansPage.jsx — pricing tiers with features, CTA to signup
src/pages/SubscriptionsPage.jsx — active subscriptions, invoices, cancel/upgrade flows
src/pages/AdminPage.jsx — metrics dashboard (MRR, churn, execution rate, client distribution, monthly evolution)
src/pages/IdeiasPage.jsx — idea bank: create, list, filter by category, delete ideas
src/pages/ExemplosPage.jsx — demo daily plans (Barbearia do Zé, Consultório de Nutrição) with full roteiros
src/pages/TermosPage.jsx — terms of service
src/pages/PrivacyPage.jsx — privacy policy
src/components/DailyPlanDisplay.jsx — renders daily plan JSON with video scenes, task checklist, copy buttons
src/components/PricingCard.jsx — pricing tier card with features list and CTA
src/components/Reveal.jsx — scroll-triggered fade-in animation: `<Reveal>{children}</Reveal>`
src/components/CountUp.jsx — number that counts up when scrolled into view: `<CountUp value={1200} suffix="+" />`
src/components/Seo.jsx — OpenGraph/Twitter/canonical tags: `<Seo title={…} description={…} image={…} siteName={…} />`. Social tags ONLY — each page still needs its own `<Helmet>` with a literal `<title>` and `<meta name="description">`
src/components/InstallPrompt.jsx — PWA install banner: Android/Chrome shows "Instalar" button via beforeinstallprompt, iOS Safari shows manual instructions, "Não agora" dismisses and remembers choice in localStorage, auto-hides when installed
src/components/ui/ — shadcn/ui primitives — import from `@/components/ui/<name>`, do not edit the files
src/hooks/use-mobile.jsx — mobile breakpoint detection
src/hooks/use-toast.js — toast notifications: `toast({title, description, variant})` renders DOM notifications without React hooks; `useToast()` returns imperative API
src/hooks/use-integrated-ai.jsx — hook for streaming AI responses (chat and daily plan generation)
src/lib/utils.js — cn() Tailwind class merge
src/lib/format.js — formatCurrency, formatNumber, formatDate, truncate, slugify
src/lib/pocketbase.js — PocketBase client initialization and auth helpers
src/lib/integratedAiClient.js — Integrated AI client for streaming requests to /integrated-ai/stream
src/lib/dailyPlan.js — daily plan generation logic, JSON parsing, validation, new format (tipo, plano_completo, titulo), tomorrow/week/month generation
src/lib/planTier.js — plan tier gating helpers (chat message limits, history retention, company limits, feature availability)
src/lib/systemPrompt.js — dynamic system prompt builder for AI with [NOME_DO_CMO] and [NOME_DA_EMPRESA] substitution, health mode rules, onboarding context injection
src/lib/exemplosPlano.js — two ready-made test examples (Barbearia do Zé, Consultório de Nutrição) with full daily plans, video roteiros, and validation function (validarPlano) that checks format compliance and generates conformance score (%), including health mode rules for Modo Saúde
src/lib/ecommerceSubscriptionsUtils.js — subscription tier helpers and plan metadata
src/lib/apiServerClient.js — HTTP client for API calls (returns raw Response)
src/config/subscriptionRoutes.js — subscription routes configuration
src/contexts/AuthContext.jsx — user authentication state (login, signup, logout, session)
src/contexts/CompanyContext.jsx — current company and subscription state
src/api/InternalEcommerceSubscriptionsApi.js — API client for platform's built-in subscription management (list, get, create, update, cancel subscriptions; fetch invoices; check plan limits)
public/manifest.json — PWA manifest: app name "Meu CMO", description, icons (192/512 maskable + any), theme colors (teal light/dark), standalone display, portrait orientation, Android screenshot, app shortcuts
public/service-worker.js — PWA service worker: cache-first for static assets (JS/CSS/icons/fonts), network-first for API and navigation, auto-versioned cache cleanup, skipWaiting for instant updates; excludes `/node_modules/.vite/deps/` from cache (always network) to prevent stale Vite dev chunks
public/icon-192.png — PWA icon 192×192 (teal "M" with growth mark)
public/icon-512.png — PWA icon 512×512 (teal "M" with growth mark)
public/icon-180.png — iOS home screen icon 180×180
public/icon-32.png — favicon 32×32
public/icon-16.png — favicon 16×16
public/screenshot-540x720.png — Android app store screenshot 540×720
public/favicon-32.png — favicon 32×32 PNG
public/favicon-16.png — favicon 16×16 PNG
vault/wiki/skills/design/SKILL.md — frontend craft, styling, typography, motion, and shadcn policy for UI surfaces.
apps/web/plugins/session-journal/ — infrastructure, DO NOT edit. Vite dev plugin injects the browser session journal client; events go over HMR (`import.meta.hot.send('session-journal:event', …)`); the plugin arranges persistence under `vault/temp/SESSION_JOURNAL.md`.
Routes: / → HomePage, /login → LoginPage, /signup → SignupPage, /onboarding → OnboardingPage, /dashboard → DashboardPage, /companies → CompaniesPage, /historico → HistoricoPage, /configuracoes → ConfiguracoesPage, /pricing → PlansPage, /subscriptions → SubscriptionsPage, /admin → AdminPage, /ideias → IdeiasPage, /termos → TermosPage, /privacidade → PrivacyPage, /exemplos → ExemplosPage

## apps/api (Express.js, port 3001)

Located at apps/api/. Run: `cd apps/api && npm run dev` (auto-started by root dev script).

src/main.js — Express server, middleware setup, route mounting; optional gateway mode (`SERVE_WEB=true`): serves built web app, proxies `/hcgi/platform/*` to PocketBase, mounts API routes under `/hcgi/api/*` for Railway compatibility
src/routes/health.js — GET /health for service health checks
src/routes/integrated-ai.js — POST /integrated-ai/stream for AI plan generation and chat responses with dynamic system prompt (substitutes [NOME_DO_CMO] and [NOME_DA_EMPRESA]), health mode rules, onboarding context
src/routes/admin.js — GET /admin/metrics (admin-only) aggregates platform metrics: total clients, MRR, churn rate, execution rate, monthly evolution data (plans generated × tasks completed), client distribution by plan, active subscriptions, client list with details
src/middleware/auth.js — JWT/session validation from PocketBase
src/middleware/errorMiddleware.js — error handler: respects err.status (400–599), uses err.message for status < 500, returns 500 for unhandled errors
src/lib/pocketbase-admin.js — admin PocketBase client for server-side operations
src/constants/prompts.js — system prompt templates with Part 1 complete spec (identity, daily plan format, video roteiro format, health mode rules, guidelines, chat assistant, limits), dynamic substitution placeholders, health mode conditional rules
Routes: /health, /integrated-ai/stream, /admin/metrics (or under `/hcgi/api/*` in gateway mode)

## apps/pocketbase (PocketBase, port 8090)

Located at apps/pocketbase/. Run: `cd apps/pocketbase && ./pocketbase serve --dir pb_data --migrationsDir pb_migrations --hooksDir pb_hooks --encryptionEnv PB_ENCRYPTION_KEY` (auto-started by root dev script).

pb_migrations/1760000000_dedupe_superuser.js — renames existing superuser email to temp value to resolve unique constraint conflict with read-only create migration
pb_migrations/1764579159_create_superuser.js — infrastructure, DO NOT edit. Read-only migration: creates superuser with PB_SUPERUSER_EMAIL and PB_SUPERUSER_PASSWORD env vars
pb_migrations/1765000000_cleanup_temp_superuser.js — removes temp-renamed superuser after create migration succeeds, leaving exactly one superuser with env credentials
pb_migrations/1787748877_meu_cmo_core.js — core schema: users (with role field), empresas, planos_diarios, tarefas, especialidades, planos, assinaturas, mensagens_chat, relatorios, historico
pb_migrations/1787752146_onboarding_conversacional.js — onboarding fields: empresas.nome_assistente, empresas.segmento ('saude'/'geral'), empresas.especialidade, empresas.perfil_pacientes, empresas.objetivos_crescimento, empresas.produtos_servicos, empresas.publico_alvo, empresas.objetivos, empresas.promocoes_atuais, empresas.onboarding_completo
pb_migrations/1787753860_plano_completo_e_tipo.js — adds planos_diarios.tipo ('dia'/'semana'/'mes'), planos_diarios.plano_completo (JSON with new format), planos_diarios.titulo (plan title)
pb_migrations/1787759259_create_ideias.js — creates ideias collection: titulo, descricao, categoria, empresa (relation), criado_em, atualizado_em; enables idea bank feature
pb_hooks/auth.js — server-side auth hooks (signup, login, password reset with email notification)
pb_hooks/subscription.js — subscription validation and plan limit enforcement
pb_hooks/ai-plan.js — AI plan generation and storage hooks, sends "plano do dia pronto" email notification when new plan created
pb_data/ — database file and attachments (git-ignored)
Routes: /api/health, /api/collections/*, /api/auth/*

## Deployment & Configuration

railway.json — Nixpacks build config: installs dependencies, builds web app with Vite, starts PocketBase + Express API
Procfile — alternative process file for Railway: `web:` target runs both PocketBase and Express
.env.example — documented environment variables for Railway (PocketBase superuser, database encryption, gateway mode, optional AI/ecommerce integrations)
RAILWAY_DEPLOY.md — complete Railway deployment guide: GitHub setup, Railway project creation, volume mounting, environment variables, custom domain, first access, troubleshooting
