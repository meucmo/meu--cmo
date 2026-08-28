# PocketBase Migrations

## What a migration is

A file under `apps/pocketbase/pb_migrations/*.js` that contains exactly one
`migrate(upFunc, downFunc)` call. PocketBase applies any file not yet recorded
in its internal `_migrations` table, in filename order, on every `serve`
startup. `reload_app` restarts PB → migrations apply automatically.

**A failed migration takes the whole site down.** The batch runs in one
transaction and `serve` aborts if any file throws, so the site will not boot —
and because the file is never recorded as applied, it fails again on every
restart until you fix it. Treat any error in a migration as site-down.

## The JSVM is not Node and not the JS SDK

Migrations run in PocketBase's embedded JS engine. Three rules follow:

- **Each callback takes ONE argument** — the transactional app. There is no
  `db` argument. `migrate((app) => { ... }, (app) => { ... })`.
- **`$app` does not exist here.** It is bound only in `pb_hooks/*.pb.js`. Use
  the callback argument. A migration using `$app` throws
  `ReferenceError: $app is not defined`.
- **Callbacks ARE real closures** — unlike `pb_hooks` handlers, which are handed
  to Go as a string and recompiled in a separate pooled VM (hence their
  "keep the handler self-contained" rule). A migration file gets its own runtime
  and `migrate` receives the callbacks as functions, so helpers and constants
  declared at the top of the file are reachable from both `up` and `down`.

Values that cross from Go are not plain JS values. `record.get()` returns the
raw Go value (a string list has `.slice` but no `.split`; a datetime is not a
JS `Date`), and field metadata is exposed as **methods** — `field.type` is a
function, so `field.type === "relation"` is always false. Call `field.type()`,
or use the typed getters in `RECORD_OPERATIONS.md`.

## Filename rules (strict)

- Must end in `.js`.
- Must start with `{unix_timestamp}_`, monotonically increasing.
- Short snake_case description after the timestamp.
- Examples:
  - `1745000000_create_tasks.js` ✅
  - `1745000001_add_due_date_to_tasks.js` ✅
  - `tasks.js` ❌ (no timestamp → ignored)
  - `1700_tasks.js` ❌ (timestamp smaller than earlier migrations → skipped silently)

**Always use `<current_time>` from your first message as the base timestamp.**
For multiple migrations in one session, increment by 1 each time:
`<current_time>`, `<current_time>+1`, `<current_time>+2`, …
Never hardcode a fixed timestamp — it will collide with past migrations.

Before creating or changing a migration, call `inspect_pocketbase` with
`include: ["migrations"]`. Use its file list together with `<current_time>` to
choose a new monotonically increasing filename. Its `applied` and `pending`
lists describe the preview database only.

Normally, overwrite a migration only when you created it during this task, the
inspection reports it as pending, and no successful `reload_app` applied it.
Applied and pre-existing migrations require a new delta migration.

An incoming `<detected-error source="u4s-production">` that names the exact
failed migration is the only other exception. It means the error came from the
published U4S database while inspection can show only preview state. Infer the
smallest compatibility repair from the production error and preview state,
edit only the named file, and preserve the final schema already reached in
preview. Do not claim to have inspected production. A later migration cannot
bypass the failure because execution stops at the failing file. If the target
schema must also change, first repair the failed file to the preview baseline,
then add a new forward migration for the additional change.

## The `up` / `down` pattern

`up` makes the change. `down` reverts it. `down` is optional but recommended it's the only protection against
silently broken state during development and revert changes.

## Concrete example — create + later alter

First migration (creates the collection):

```js
// apps/pocketbase/pb_migrations/1729500000_create_tasks.js
/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    const collection = new Collection({
      type: "base",
      name: "tasks",
      // Owner-scoped by default — only the user who created a task can
      // see or change it. Loosen ONLY if the user prompt explicitly
      // asked for public/shared semantics.
      listRule: "@request.auth.id != '' && @request.auth.id = owner",
      viewRule: "@request.auth.id != '' && @request.auth.id = owner",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && @request.auth.id = owner",
      deleteRule: "@request.auth.id != '' && @request.auth.id = owner",
      fields: [
        { name: "title", type: "text", required: true, max: 200 },
        { name: "done", type: "bool" },
        {
          name: "owner",
          type: "relation",
          required: true,
          maxSelect: 1,
          collectionId: users.id,
          cascadeDelete: true,
        },
        { name: "created", type: "autodate", onCreate: true, onUpdate: false },
        { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
      ],
    });
    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("tasks");
    app.delete(collection);
  },
);
```

Second migration (adds a field — note it's a NEW file, we never edit the first):

```js
// apps/pocketbase/pb_migrations/1729500001_add_due_date_to_tasks.js
/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("tasks");
    collection.fields.add(
      new DateField({
        name: "due",
        required: false,
      }),
    );
    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("tasks");
    collection.fields.removeByName("due");
    app.save(collection);
  },
);
```

## How to ship a migration

1. Write the file via `write_file` into
   `apps/pocketbase/pb_migrations/<timestamp>_<name>.js`.
2. Call `reload_app` ONCE. PocketBase reboots, applies unapplied migrations
   inside a transaction, and ports come back up.
3. If `reload_app` reports errors from PocketBase (e.g. "failed to apply
   migration ..."), call `inspect_pocketbase` with
   `include: ["migrations", "errors"]`. If the failing migration was created
   during this task and remains pending, fix that same file and `reload_app`
   again. Unless an incoming `<detected-error source="u4s-production">` names
   that exact file, do not rewrite an applied migration; create a forward delta
   instead. If a pre-existing migration is still pending and failing, surface
   the blocker—a later migration cannot run past it.
4. **Verify the migration actually applied — don't assume.** `reload_app`
   coming back up is NOT proof your schema change landed (a migration can be
   silently skipped or can no-op itself — see "Fail loud" below). Confirm the
   real state:
   - `inspect_pocketbase` with `include: ["schema"]` — the new collection /
     field / rule you expected is present. If it isn't, the migration was
     skipped (bad timestamp, wrong `pb_migrations/` path, `.js` extension) or
     it returned early.
   - `inspect_pocketbase` with `include: ["errors"]` (or the injected
     `<pocketbase_recent_errors>` block) — no apply-time error was logged.

   This is the PocketBase equivalent of the `curl`-after-`reload_app` route
   check the `express` / `integrated-ai` skills require: prove the change is
   live before moving on.

## Fail loud — throw, never silently `return`, on a missing prerequisite

A migration that depends on a prerequisite — an env var (a domain, an API
base), or a collection another migration was supposed to create — must
**throw** when that prerequisite is missing. It must NOT `return` early.

PocketBase records a migration as *applied* the moment its `up` function
returns without throwing. So an early `return` on a missing prerequisite
marks the migration done, leaves the intended change unconfigured, and
produces **no error anywhere** — `reload_app` looks green, `inspect_pocketbase`
with `include: ["errors"]` shows nothing, and the migration will never retry
because PB thinks it already ran.
Throwing instead rolls back the transaction, fails the apply visibly, and lets
you (or the auto-fix agent) see and fix the real cause.

Read env inside the migration with `$os.getenv(...)` (the same JSVM global the
hooks use — there is no `process.env` here).

```js
// apps/pocketbase/pb_migrations/1729500002_configure_verification.js
/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const domain = $os.getenv("WEBSITE_DOMAIN");

  // ❌ WRONG — PB marks this migration "applied", the verification template is
  // never configured, and nothing ever surfaces the misconfiguration.
  // if (!domain) return;

  // ✅ CORRECT — fail loud so the apply fails and the cause is visible.
  if (!domain) {
    throw new Error(
      "WEBSITE_DOMAIN is not set — cannot configure the verification template",
    );
  }

  const users = app.findCollectionByNameOrId("users");
  // ... now use `domain` to configure the collection (e.g. build the email
  // template's link) and persist it — the point is that we only get here with
  // a real prerequisite in hand.
  app.save(users);
});
```

(This settings-style migration omits the optional `down` for brevity; a
schema migration should still ship one — see "The `up` / `down` pattern".)

Only `return` early when the migration is a genuine, intended no-op in that
state (rare) — and even then, prefer not shipping the migration at all over
one that quietly does nothing. "Skip when the collection already exists" is a
different case: resolve it with `app.findCollectionByNameOrId(...)` and
continue (see the multi-step `return` mistake below), don't bail on the whole
file.

## Common mistakes

- **Calling `new Collection({ name: "X" })` when `X` is already in
  `<pocketbase_schema>`.** PB rejects with `name: Collection name must be
unique (case insensitive)` and rolls back the whole `up` function.
  In this template the `users` auth collection is pre-provisioned, so a
  bare `new Collection({ type: "auth", name: "users", ... })` will always
  fail on first generation. Use the find-or-create pattern from
  `CREATE_AUTH_COLLECTION.md` / `CREATE_COLLECTION.md`:
  ```js
  let users;
  try {
    users = app.findCollectionByNameOrId("users");
  } catch (_) {
    users = new Collection({ type: "auth", name: "users" /* ... */ });
    app.save(users);
  }
  ```
  Do NOT wrap a bare `app.save(new Collection(...))` in `try/catch` to mask
  the error — that leaves an unreachable `new Collection(...)` block in the
  file. Switch to find-or-create.
- **Using `return` after "already exists" in a multi-step `up` migration.**
  This silently skips every later operation in the file. Example: if `users`
  already exists and the migration returns before creating `tasks`, PocketBase
  starts cleanly but the app collection is missing. Instead, resolve the
  existing collection and continue, or split the work into separate migrations.
- **Editing an already-applied migration.** PB keys migrations by filename;
  if the filename is already in `_migrations` system collection, the edited migration is NOT
  re-applied. Add a new migration with the delta.
- **Treating `recent_failures` as current migration state.** It comes from
  accumulated PM2 logs and can remain after a later successful reload. Use the
  exact `applied` / `pending` lists for state and the failure entry only as
  diagnostic evidence.
- **Calling `migrations:revert`.** Never call it. It executes destructive down
  logic, removes migration history, and deletes files; only the
  customer-initiated message-revert flow may trigger it. Use
  `inspect_pocketbase` for read-only status inspection.
- **Decide field options BEFORE the first `reload_app`.** Once a migration is
  applied, fixing `required`, `max`, or `pattern` on the same field requires
  a NEW delta migration via `collection.fields.getByName(...)` — see
  `UPDATE_FIELD.md`. Avoid the flip-flop pattern of writing a migration,
  applying it, realising a flag is wrong, editing the original (no-op),
  then writing a delta. Pick the right option upfront.
- **Reflexive `required: true`.** Most fields should NOT be required.
  Required-by-default produces immediate frontend validation errors and
  follow-up "fix" migrations. Two especially nasty cases on PB:
  `required: true` on `bool` rejects `false`, and `required: true` on
  `number` rejects `0`. See `FIELD_TYPES.md` for the per-type policy.
- **Writing schema changes somewhere other than `pb_migrations/`.** A route
  file that POSTs to `/api/collections` creates untracked state that gets
  wiped on the next container start.
- **Forgetting the closing `});`** — migrate takes two arg functions, and
  missing a `});` will usually surface as a cryptic JSVM parse error.
- **Using `Date.now()` for the filename in the file body.** The timestamp is
  in the filename only, used for ordering. The body is plain migration code.
