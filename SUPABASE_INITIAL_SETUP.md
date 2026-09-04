# Meu CMO — Stage 1: criar estrutura no Supabase (passo a passo)

## O que deu errado na sua tela

No SQL Editor você colou só isto:

```
profiles
empresas
planos_diarios
tarefas
mensagens_chat
ideias
```

Isso **não é SQL**. São apenas **nomes** de tabelas. O Postgres espera comandos (`CREATE TABLE`, `CREATE POLICY`, etc.). Por isso o erro:

`ERROR: 42601: syntax error at or near "profiles"`

**É esperado.** Não precisa “excluir” o projeto Supabase por causa disso. Só apague o texto da query e rode o script completo.

---

## O que este script faz / não faz

| Faz | Não faz |
|-----|---------|
| Cria 6 tabelas no schema `public` | Não cria `_integratedAi*` |
| FKs, índices, timestamps | Não migra dados do PocketBase |
| Trigger: profile ao criar user em `auth.users` | Não mexe em PocketBase, Netlify, GitHub |
| RLS + políticas dono/admin | Não altera o app (design, textos, layout) |
| Idempotente (`IF NOT EXISTS` / `DROP POLICY IF EXISTS`) | Não apaga tabelas suas que já existam com outro nome |

Arquivo no projeto: `supabase/001_initial_schema.sql`

---

## Passo a passo (Supabase Dashboard)

1. Abra o **projeto** no [Supabase](https://supabase.com/dashboard).
2. Menu lateral → **SQL Editor**.
3. Se a aba atual tem só os nomes (`profiles`, `empresas`…):
   - selecione **todo** o texto da query e **apague** (Delete/Backspace), **ou**
   - clique em **+** / **New query** para abrir uma consulta vazia.
4. **Não** digite os nomes das tabelas.
5. Abra no seu computador o arquivo  
   `supabase/001_initial_schema.sql`  
   (do repositório Meu CMO) e copie **o arquivo inteiro** (do `BEGIN;` até o final do `COMMIT;` principal — o bloco de ROLLBACK no comentário no fim **não** deve ser executado agora).
6. Cole tudo na query vazia do SQL Editor.
7. Clique em **Run** (ou Ctrl/Cmd + Enter).
8. Resultado esperado: sucesso (sem `syntax error`). Pode aparecer “Success” / “No rows returned” — normal para DDL.
9. Menu lateral → **Table Editor** → schema **public**.
10. Confira se existem as tabelas:
    - `profiles`
    - `empresas`
    - `planos_diarios`
    - `tarefas`
    - `mensagens_chat`
    - `ideias`

Se o Table Editor ainda estiver vazio **depois** de rodar o script completo com sucesso, atualize a página (F5) e confira se o projeto/schema selecionado é o correto (`public`).

---

## Preciso excluir algo?

| Situação | Ação |
|----------|------|
| Só a query com os 6 nomes | **Não** exclua o projeto. Apague só o texto da query. |
| Script rodou pela metade e deu erro no meio | Leia a mensagem. O script usa transação (`BEGIN`/`COMMIT`): em geral nada fica pela metade. Corrija e rode de novo (é idempotente). |
| Quer **desfazer** a estrutura deste script | Só então use o bloco **ROLLBACK** comentado no final de `001_initial_schema.sql` (em query separada). Isso apaga **só** essas 6 tabelas + funções/triggers deste script — **não** apaga `auth.users`. |
| Já tinha outras tabelas suas no `public` | O script **não** as dropa. Só cria o que falta com `IF NOT EXISTS`. |

---

## Depois de criar as tabelas

1. **Não** integre o código do app ainda.
2. Compare colunas/regras com o schema real do PocketBase (preview + produção, se divergirem).
3. Só na próxima etapa: Auth, client Supabase, feature flag, etc.

---

## Onde está o SQL

Copie de: **`supabase/001_initial_schema.sql`** no repositório.

Se preferir colar daqui no chat do builder, peça: “me manda o conteúdo de 001_initial_schema.sql” — o arquivo completo tem ~420 linhas e deve ir **inteiro** no SQL Editor de uma vez.
