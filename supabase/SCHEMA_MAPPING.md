# Meu CMO — Mapeamento de Schema: PocketBase → Supabase

**Etapa:** validação do mapeamento (antes de qualquer integração de código).
**Princípios:** PocketBase intacto (fallback), sem migração de dados reais,
sem alterações visuais, sem segredos no chat.

Este documento compara cada coleção do PocketBase (inventário do projeto,
`pb_migrations/`) com as tabelas já criadas e validadas no Supabase
(`supabase/001_initial_schema.sql`) e confirma a cobertura campo a campo.

---

## Resumo

| Coleção PocketBase | Tabela Supabase | Cobertura |
| --- | --- | --- |
| `users` (auth) | `profiles` (+ `auth.users`) | ✅ completa |
| `empresas` | `empresas` | ✅ completa |
| `planos_diarios` | `planos_diarios` | ✅ completa |
| `tarefas` | `tarefas` | ✅ completa |
| `mensagens_chat` | `mensagens_chat` | ✅ completa |
| `ideias` | `ideias` | ✅ completa |
| `_integratedAiMessages` | — | ⛔ fora do escopo (mantida na plataforma) |
| `_integratedAiImages` | — | ⛔ fora do escopo (mantida na plataforma) |

**Conclusão:** nenhum campo ou relacionamento de domínio está faltante no
Supabase. A próxima etapa (camada de abstração + troca de auth) pode prosseguir
após o teste de compatibilidade em `/migracao-test`.

---

## Convenções de mapeamento

- `owner` (relation → `users`) → `owner_id` (uuid → `profiles.id`)
- `empresa` (relation → `empresas`) → `empresa_id` (uuid → `empresas.id`)
- `plano` (relation → `planos_diarios`) → `plano_id` (uuid → `planos_diarios.id`)
- `created` (autodate) → `created_at` (timestamptz default `now()`)
- `updated` (autodate) → `updated_at` (timestamptz, trigger `set_updated_at`)
- `avatar` (file) → `avatar_url` (text — URL do Storage bucket)
- `onboarding_respostas` (json) → `onboarding_respostas` (jsonb)
- `roteiro_video` / `plano_completo` (json) → jsonb
- Campo `pb_id` (text, unique) adicionado a cada tabela para mapear o id
  original do PocketBase durante a migração de dados (futura).

---

## Detalhamento campo a campo

### users (auth) → profiles

| PocketBase `users` | Supabase `profiles` | Obs. |
| --- | --- | --- |
| id | id (FK auth.users) | uuid |
| email | email | |
| name | name | |
| avatar (file) | avatar_url (text) | URL do Storage |
| role (select customer/admin) | role (CHECK) | |
| verified | — | nativo do `auth.users` |
| created / updated | created_at / updated_at | |

### empresas → empresas

| PocketBase | Supabase | Obs. |
| --- | --- | --- |
| id | id (gen_random_uuid) | |
| owner | owner_id (FK profiles) | |
| nome | nome | NOT NULL |
| segmento (select) | segmento (CHECK) | negocio_local/saude/geral |
| especialidade | especialidade | |
| cidade | cidade | |
| estado | estado | |
| publico_alvo | publico_alvo | |
| descricao | descricao | |
| assistente_nome | assistente_nome | NOT NULL default 'CMO' |
| tom_de_voz (select) | tom_de_voz (CHECK) | |
| instagram | instagram | |
| whatsapp | whatsapp | |
| perfil_pacientes | perfil_pacientes | |
| objetivos_crescimento | objetivos_crescimento | |
| produtos_servicos | produtos_servicos | |
| objetivos | objetivos | |
| promocoes_atuais | promocoes_atuais | |
| onboarding_completo (bool) | onboarding_completo (bool) | default false |
| onboarding_respostas (json) | onboarding_respostas (jsonb) | |
| created / updated | created_at / updated_at | |

### planos_diarios → planos_diarios

| PocketBase | Supabase | Obs. |
| --- | --- | --- |
| id | id | |
| empresa | empresa_id (FK) | |
| owner | owner_id (FK) | |
| data (text YYYY-MM-DD) | data (text) | UNIQUE(empresa_id, data) |
| foco | foco | |
| resumo | resumo | |
| roteiro_video (json) | roteiro_video (jsonb) | |
| tipo (select) | tipo (CHECK) | diario/semana/mes |
| plano_completo (json) | plano_completo (jsonb) | |
| titulo | titulo | |
| created / updated | created_at / updated_at | |

### tarefas → tarefas

| PocketBase | Supabase | Obs. |
| --- | --- | --- |
| id | id | |
| plano | plano_id (FK) | |
| empresa | empresa_id (FK) | |
| owner | owner_id (FK) | |
| tipo (select) | tipo (CHECK) | stories/reels/post/acao_comercial/relacionamento/educacao |
| titulo | titulo | NOT NULL |
| descricao | descricao | |
| concluida (bool) | concluida (bool) | default false |
| ordem (number int) | ordem (integer) | |
| created / updated | created_at / updated_at | |

### mensagens_chat → mensagens_chat

| PocketBase | Supabase | Obs. |
| --- | --- | --- |
| id | id | |
| empresa | empresa_id (FK, SET NULL) | |
| owner | owner_id (FK) | |
| remetente (select) | remetente (CHECK) | usuario/ia |
| conteudo | conteudo | NOT NULL |
| created / updated | created_at / updated_at | |

### ideias → ideias

| PocketBase | Supabase | Obs. |
| --- | --- | --- |
| id | id | |
| owner | owner_id (FK) | |
| empresa | empresa_id (FK, SET NULL) | |
| titulo | titulo | NOT NULL |
| descricao | descricao | |
| categoria (select) | categoria (CHECK) | |
| tags | tags | |
| reutilizada (bool) | reutilizada (bool) | default false |
| created / updated | created_at / updated_at | |

---

## Regras de acesso (RLS) — equivalência

PocketBase usa regras owner-scoped + admin override. O Supabase replica com
RLS policies `TO authenticated`:

- SELECT: `owner_id = auth.uid() OR public.is_admin()`
- INSERT: `WITH CHECK (owner_id = auth.uid())`
- UPDATE/DELETE: owner only (exceto empresas: admin também pode)
- `profiles`: SELECT próprio ou admin; UPDATE próprio.

Equivalência confirmada para todas as 6 tabelas.

---

## Pontos de atenção (não bloqueantes para esta etapa)

1. **`_integratedAiMessages` / `_integratedAiImages`** — permanecem na
   plataforma Hostinger. `planTier.js#countTodayUserMessages` e
   `use-integrated-ai.jsx` continuam lendo PocketBase; decisão de
   reimplementação adiada.
2. **Auth JWT** — o serviço de IA da plataforma valida JWT do PocketBase.
   A troca de auth (Stage 5) exigirá adaptação do middleware
   `apps/api/src/middleware/pocketbase-auth.js`. Não alterar agora.
3. **Storage** — avatares e imagens de IA: buckets Supabase (Stage 3, futuro).
4. **Assinaturas/Stripe** — continuam no Express + loja Hostinger; fora do
   schema de domínio.

---

## Como validar (próxima ação segura)

1. Definir no ambiente (Netlify/Vite, **não no chat**):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. (Opcional, padrão `false`) `VITE_USE_SUPABASE=false` — PocketBase ativo.
3. Novo deploy e abrir `/migracao-test`.
4. Confirmar: cliente configurado ✅ e cada tabela com status
   `Acessível` ou `RLS bloqueou (esperado sem sessão)`.
5. Só após tudo verde, prosseguir para a camada de abstração de dados
   (Stage 4) — ainda com a flag desligada.
