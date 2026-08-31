# Meu CMO — Codebase Map

Monorepo for a full-stack SaaS platform: AI-powered daily plan generator for service businesses (salons, clinics, consultancies). Three services (web frontend, Express API, PocketBase backend) coordinated via npm workspaces. Deployable to Railway or Hostinger AI Builder.

| Service | Port | Purpose |
|---------|------|---------|
| **web** | 5173 (dev) / 3000 (prod) | React + Vite frontend; PWA-enabled |
| **api** | 3001 | Express.js REST API; AI chat, plan generation, admin metrics |
| **pocketbase** | 8090 | PocketBase backend; auth, database, file storage |

---

## apps/web (React + Vite, port 5173 dev / 3000 prod)

Located at apps/web/. Run: `npm run dev -w apps/web` (auto-started by root dev script).

src/main.jsx — React entry point; mounts App component
src/App.jsx — main app router; redirects unauthenticated users to /login, authenticated to /dashboard
src/pages/HomePage.jsx — landing page with feature highlights and CTA
src/pages/LoginPage.jsx — login form with email/password validation
src/pages/SignupPage.jsx — signup form with email/password/company name validation
src/pages/OnboardingPage.jsx — conversational onboarding: company name, segment (health/general), specialty, patient profile, growth objectives, products/services, target audience, goals, current promotions; saves to empresas collection
src/pages/DashboardPage.jsx — main app hub: displays current company, subscription tier, quick actions (generate plan, view ideas, chat), plan history, task completion stats
src/pages/CompaniesPage.jsx — list and switch between user's companies
src/pages/HistoricoPage.jsx — view all generated plans with filters and export options
src/pages/ConfiguracoesPage.jsx — user and company settings, password change, company deletion
src/pages/PlansPage.jsx — pricing tiers (Starter, Professional, Enterprise) with feature comparison and CTA buttons
src/pages/SubscriptionsPage.jsx — manage active subscriptions, view invoices, upgrade/downgrade/cancel
src/pages/AdminPage.jsx — admin-only dashboard: platform metrics (total clients, MRR, churn, execution rate), monthly evolution charts, client distribution by plan, active subscriptions, client list with details
src/pages/IdeiasPage.jsx — idea bank: create, view, filter, delete ideas; linked to current company
src/pages/ExemplosPage.jsx — showcase two ready-made examples (Barbearia do Zé, Consultório de Nutrição) with full daily plans and video roteiros
src/pages/TermosPage.jsx — terms of service
src/pages/PrivacyPage.jsx — privacy policy
src/components/Navbar.jsx — top navigation bar with logo, user menu, logout
src/components/Sidebar.jsx — left sidebar with main navigation links
src/components/ChatAI.jsx — chat interface for AI plan generation and conversation; calls POST /hcgi/api/integrated-ai/stream with streaming response
src/components/PlanGenerator.jsx — form to generate daily/weekly/monthly plans; calls POST /hcgi/api/integrated-ai/stream
src/components/PlanDisplay.jsx — renders generated plan with tasks, video roteiros, health mode indicators
src/components/TaskList.jsx — displays and manages tasks from a plan; marks complete/incomplete
src/components/SubscriptionCard.jsx — displays subscription tier details and action buttons
src/components/ProtectedRoute.jsx — route guard: redirects unauthenticated users to /login
src/lib/apiClient.js — HTTP client for API calls (returns raw Response); uses relative path `/hcgi/api` (routed by sandbox dev proxy or Express gateway in Railway)
src/lib/apiServerClient.js — HTTP client for API calls (returns raw Response); uses relative path `/hcgi/api` (routed by sandbox dev proxy or Express gateway in Railway)
src/lib/exemplosPlano.js — two ready-made test examples (Barbearia do Zé, Consultório de Nutrição) with full daily plans, video roteiros, and validation function (validarPlano) that checks format compliance and generates conformance score (%), including health mode rules for Modo Saúde
src/lib/ecommerceSubscriptionsUtils.js — subscription tier helpers and plan metadata
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
vite.config.js — Vite config: React plugin, alias, build output
package.json — web dependencies (React, Vite, shadcn/ui, TailwindCSS, etc.), build scripts, Node engines >=20.19.0
vault/wiki/skills/design/SKILL.md — frontend craft, styling, typography, motion, and shadcn policy for UI surfaces
apps/web/plugins/session-journal/ — infrastructure, DO NOT edit. Vite dev plugin injects the browser session journal client; events go over HMR (`import.meta.hot.send('session-journal:event', …)`); the plugin arranges persistence under `vault/temp/SESSION_JOURNAL.md`
.gitignore — git ignore rules for node_modules, pb_data, .env, builds, logs, temp files
README.md — project overview, stack, monorepo structure, setup, deployment guide
SETUP.md — step-by-step GitHub export and push instructions
Routes: / → HomePage, /login → LoginPage, /signup → SignupPage, /onboarding → OnboardingPage, /dashboard → DashboardPage, /companies → CompaniesPage, /historico → HistoricoPage, /configuracoes → ConfiguracoesPage, /pricing → PlansPage, /subscriptions → SubscriptionsPage, /admin → AdminPage, /ideias → IdeiasPage, /termos → TermosPage, /privacidade → PrivacyPage, /exemplos → ExemplosPage

## apps/api (Express.js, port 3001)

Located at apps/api/. Run: `npm run dev -w apps/api` (auto-started by root dev script).

src/main.js — Express server, middleware setup, route mounting; optional gateway mode (`SERVE_WEB=true`): serves built web app, proxies `/hcgi/platform/*` to PocketBase, mounts API routes under `/hcgi/api/*` for Railway compatibility
src/routes/health.js — GET /health for service health checks
src/routes/integrated-ai.js — POST /integrated-ai/stream for AI plan generation and chat responses with dynamic system prompt (substitutes [NOME_DO_CMO] and [NOME_DA_EMPRESA]), health mode rules, onboarding context
src/routes/admin.js — GET /admin/metrics (admin-only) aggregates platform metrics: total clients, MRR, churn rate, execution rate, monthly evolution data (plans generated × tasks completed), client distribution by plan, active subscriptions, client list with details
src/middleware/auth.js — JWT/session validation from PocketBase
src/middleware/errorMiddleware.js — error handler: respects err.status (400–599), uses err.message for status < 500, returns 500 for unhandled errors
src/lib/pocketbase-admin.js — admin PocketBase client for server-side operations
src/constants/prompts.js — system prompt templates with Part 1 complete spec (identity, daily plan format, video roteiro format, health mode rules, guidelines, chat assistant, limits), dynamic substitution placeholders, health mode conditional rules
package.json — api dependencies (Express, dotenv, etc.), dev scripts, Node engines >=20.19.0
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
pocketbase — binary executable (chmod +x required on Railway startup)
Routes: /api/health, /api/collections/*, /api/auth/*

## Deployment & Configuration

.gitignore — git ignore rules for node_modules, pb_data, .env, builds, logs, temp files
package.json — root workspace configuration (npm workspaces: apps/web, apps/api, apps/pocketbase), Node engines >=20.19.0, build scripts
railway.json — Nixpacks build config: `npm ci && NODE_OPTIONS=--max_old_space_size=4096 npm run build -w apps/web` (canonical workspace build with memory buffer), startCommand with `chmod +x apps/pocketbase/pocketbase` before running PocketBase + Express, healthcheckTimeout 180s
Procfile — process file for Railway: `web:` target runs chmod + PocketBase + Express (matches railway.json startCommand)
.env.example — documented environment variables for Railway (PocketBase superuser, database encryption, gateway mode, optional AI/ecommerce integrations)
RAILWAY_DEPLOY.md — complete Railway deployment guide: GitHub setup, Railway project creation, volume mounting, environment variables, custom domain, first access, troubleshooting
README.md — project overview, stack, monorepo structure, setup, deployment guide
SETUP.md — step-by-step GitHub export and push instructions
