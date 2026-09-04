-- =============================================================================
-- Meu CMO — Supabase Stage 1: estrutura inicial (schema public)
-- =============================================================================
-- Objetivo: criar APENAS a estrutura (tabelas, FKs, índices, RLS base).
-- NÃO migra dados. NÃO remove PocketBase. NÃO cria _integratedAi*.
--
-- Como usar:
--   1. Abra o projeto no Supabase Dashboard
--   2. SQL Editor → New query
--   3. Cole este arquivo inteiro
--   4. Run (Ctrl/Cmd + Enter)
--   5. Table Editor → schema public → confira as 6 tabelas
--
-- Idempotência: usa IF NOT EXISTS / DROP POLICY IF EXISTS onde o Postgres permite.
-- =============================================================================

BEGIN;

-- Extensões úteis (gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1) profiles  (espelho de app user; 1:1 com auth.users)
--    PocketBase: collection auth "users" (name, avatar, role, verified via auth)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email         text,
  name          text,
  avatar_url    text,
  role          text NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'admin')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- Auto-cria profile no signup (auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2) empresas
--    Fonte: PocketBase collection "empresas" (inventário preview)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.empresas (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id               uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  nome                   text NOT NULL,
  segmento               text NOT NULL
                           CHECK (segmento IN ('negocio_local', 'saude', 'geral')),
  especialidade          text,
  cidade                 text,
  estado                 text,
  publico_alvo           text,
  descricao              text,
  assistente_nome        text NOT NULL DEFAULT 'CMO',
  tom_de_voz             text
                           CHECK (tom_de_voz IS NULL OR tom_de_voz IN (
                             'profissional', 'descontraido', 'acolhedor', 'tecnico'
                           )),
  instagram              text,
  whatsapp               text,
  perfil_pacientes       text,
  objetivos_crescimento  text,
  produtos_servicos      text,
  objetivos              text,
  promocoes_atuais       text,
  onboarding_completo    boolean NOT NULL DEFAULT false,
  onboarding_respostas   jsonb,
  -- pb_id: opcional, para mapear id PocketBase na migração de dados (Stage 9)
  pb_id                  text UNIQUE,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_empresas_owner ON public.empresas (owner_id);

DROP TRIGGER IF EXISTS trg_empresas_updated_at ON public.empresas;
CREATE TRIGGER trg_empresas_updated_at
  BEFORE UPDATE ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3) planos_diarios
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.planos_diarios (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      uuid NOT NULL REFERENCES public.empresas (id) ON DELETE CASCADE,
  owner_id        uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  data            text NOT NULL,          -- YYYY-MM-DD (como no PB)
  foco            text,
  resumo          text,
  roteiro_video   jsonb,
  tipo            text
                    CHECK (tipo IS NULL OR tipo IN ('diario', 'semana', 'mes')),
  plano_completo  jsonb,
  titulo          text,
  pb_id           text UNIQUE,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_planos_diarios_empresa_data UNIQUE (empresa_id, data)
);

CREATE INDEX IF NOT EXISTS idx_planos_diarios_owner ON public.planos_diarios (owner_id);
CREATE INDEX IF NOT EXISTS idx_planos_diarios_empresa ON public.planos_diarios (empresa_id);

DROP TRIGGER IF EXISTS trg_planos_diarios_updated_at ON public.planos_diarios;
CREATE TRIGGER trg_planos_diarios_updated_at
  BEFORE UPDATE ON public.planos_diarios
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4) tarefas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tarefas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id     uuid NOT NULL REFERENCES public.planos_diarios (id) ON DELETE CASCADE,
  empresa_id   uuid NOT NULL REFERENCES public.empresas (id) ON DELETE CASCADE,
  owner_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  tipo         text NOT NULL
                 CHECK (tipo IN (
                   'stories', 'reels', 'post', 'acao_comercial', 'relacionamento', 'educacao'
                 )),
  titulo       text NOT NULL,
  descricao    text,
  concluida    boolean NOT NULL DEFAULT false,
  ordem        integer DEFAULT 0,
  pb_id        text UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarefas_plano ON public.tarefas (plano_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_owner ON public.tarefas (owner_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_empresa ON public.tarefas (empresa_id);

DROP TRIGGER IF EXISTS trg_tarefas_updated_at ON public.tarefas;
CREATE TRIGGER trg_tarefas_updated_at
  BEFORE UPDATE ON public.tarefas
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 5) mensagens_chat
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mensagens_chat (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id   uuid REFERENCES public.empresas (id) ON DELETE SET NULL,
  owner_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  remetente    text NOT NULL CHECK (remetente IN ('usuario', 'ia')),
  conteudo     text NOT NULL,
  pb_id        text UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_chat_owner ON public.mensagens_chat (owner_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_chat_empresa ON public.mensagens_chat (empresa_id);

DROP TRIGGER IF EXISTS trg_mensagens_chat_updated_at ON public.mensagens_chat;
CREATE TRIGGER trg_mensagens_chat_updated_at
  BEFORE UPDATE ON public.mensagens_chat
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 6) ideias
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ideias (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  empresa_id   uuid REFERENCES public.empresas (id) ON DELETE SET NULL,
  titulo       text NOT NULL,
  descricao    text,
  categoria    text
                 CHECK (categoria IS NULL OR categoria IN (
                   'stories', 'reels', 'post', 'acao_comercial', 'relacionamento',
                   'educacao', 'promocao', 'outro'
                 )),
  tags         text,
  reutilizada  boolean NOT NULL DEFAULT false,
  pb_id        text UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ideias_owner ON public.ideias (owner_id);
CREATE INDEX IF NOT EXISTS idx_ideias_empresa ON public.ideias (empresa_id);

DROP TRIGGER IF EXISTS trg_ideias_updated_at ON public.ideias;
CREATE TRIGGER trg_ideias_updated_at
  BEFORE UPDATE ON public.ideias
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- RLS — dono (auth.uid() = owner_id) + admin (profiles.role = 'admin')
-- =============================================================================

-- Helper: usuário atual é admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'admin'
  );
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideias ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
DROP POLICY IF EXISTS "profiles_select_own_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_own_or_admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Insert de profile vem do trigger (service); bloqueia insert direto do client
-- (exceto se quiser permitir — por padrão não)

-- ---- empresas ----
DROP POLICY IF EXISTS "empresas_select_own_or_admin" ON public.empresas;
CREATE POLICY "empresas_select_own_or_admin"
  ON public.empresas FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "empresas_insert_own" ON public.empresas;
CREATE POLICY "empresas_insert_own"
  ON public.empresas FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "empresas_update_own_or_admin" ON public.empresas;
CREATE POLICY "empresas_update_own_or_admin"
  ON public.empresas FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "empresas_delete_own_or_admin" ON public.empresas;
CREATE POLICY "empresas_delete_own_or_admin"
  ON public.empresas FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

-- ---- planos_diarios ----
DROP POLICY IF EXISTS "planos_select_own_or_admin" ON public.planos_diarios;
CREATE POLICY "planos_select_own_or_admin"
  ON public.planos_diarios FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "planos_insert_own" ON public.planos_diarios;
CREATE POLICY "planos_insert_own"
  ON public.planos_diarios FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "planos_update_own" ON public.planos_diarios;
CREATE POLICY "planos_update_own"
  ON public.planos_diarios FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "planos_delete_own" ON public.planos_diarios;
CREATE POLICY "planos_delete_own"
  ON public.planos_diarios FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ---- tarefas ----
DROP POLICY IF EXISTS "tarefas_select_own_or_admin" ON public.tarefas;
CREATE POLICY "tarefas_select_own_or_admin"
  ON public.tarefas FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "tarefas_insert_own" ON public.tarefas;
CREATE POLICY "tarefas_insert_own"
  ON public.tarefas FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "tarefas_update_own" ON public.tarefas;
CREATE POLICY "tarefas_update_own"
  ON public.tarefas FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "tarefas_delete_own" ON public.tarefas;
CREATE POLICY "tarefas_delete_own"
  ON public.tarefas FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ---- mensagens_chat ----
DROP POLICY IF EXISTS "msg_select_own_or_admin" ON public.mensagens_chat;
CREATE POLICY "msg_select_own_or_admin"
  ON public.mensagens_chat FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "msg_insert_own" ON public.mensagens_chat;
CREATE POLICY "msg_insert_own"
  ON public.mensagens_chat FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "msg_update_own" ON public.mensagens_chat;
CREATE POLICY "msg_update_own"
  ON public.mensagens_chat FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "msg_delete_own" ON public.mensagens_chat;
CREATE POLICY "msg_delete_own"
  ON public.mensagens_chat FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ---- ideias ----
DROP POLICY IF EXISTS "ideias_select_own_or_admin" ON public.ideias;
CREATE POLICY "ideias_select_own_or_admin"
  ON public.ideias FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "ideias_insert_own" ON public.ideias;
CREATE POLICY "ideias_insert_own"
  ON public.ideias FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "ideias_update_own" ON public.ideias;
CREATE POLICY "ideias_update_own"
  ON public.ideias FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "ideias_delete_own" ON public.ideias;
CREATE POLICY "ideias_delete_own"
  ON public.ideias FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

COMMIT;

-- =============================================================================
-- O QUE NÃO ESTÁ NESTE SCRIPT (de propósito)
-- =============================================================================
-- • _integratedAiMessages / _integratedAiImages — decisão adiada (plataforma
--   Hostinger vs reimplementar no Supabase Storage + tabelas próprias).
-- • Storage buckets (avatars, ai-images) — Stage 3.
-- • Migração de dados / seed — Stage 9.
-- • Assinaturas Stripe / ecommerce — continuam no Express + store Hostinger
--   até o cutover de auth; não fazem parte do schema de domínio CMO.
-- • Campos legados ou nomes alternativos em migrations antigas do PB
--   (ex.: nome_assistente vs assistente_nome) — o inventário preview usa
--   assistente_nome; se produção divergir, ajuste com ALTER TABLE depois.
--
-- ROLLBACK (só o que este script criou — NÃO apaga auth.users nem dados
-- de outras tabelas suas):
--
-- BEGIN;
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- DROP FUNCTION IF EXISTS public.handle_new_user();
-- DROP FUNCTION IF EXISTS public.is_admin();
-- DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
-- DROP TABLE IF EXISTS public.ideias CASCADE;
-- DROP TABLE IF EXISTS public.mensagens_chat CASCADE;
-- DROP TABLE IF EXISTS public.tarefas CASCADE;
-- DROP TABLE IF EXISTS public.planos_diarios CASCADE;
-- DROP TABLE IF EXISTS public.empresas CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- COMMIT;
-- =============================================================================
