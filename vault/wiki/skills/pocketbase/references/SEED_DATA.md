# Seed Data

## Environment boundary

Preview and production have separate PocketBase databases and file storage.
Rows and files created at runtime in preview are stored under preview's
`pb_data/`, which is not copied when the website is published. Publishing only
ships source files such as migrations and hooks.

Use a timestamped migration for data that must be created in production or
reproduced after a database reset. Keep files needed by that migration in a
versioned source directory outside `pb_data/`. Runtime user content should be
created in the intended environment; do not attempt to synchronize preview and
production with an `onBootstrap` hook.

## Two places seeding can live

1. **Inside the same migration that creates the collection** — preferred
   when the data is "essential defaults" (a system admin user, default
   categories, starter settings). Tied to the schema lifecycle.
2. **In a separate later migration** — preferred when the data is volume
   content ("import these 50 rows") or can be re-run. Easier to tweak
   without re-creating the collection.

Both use the same API: `new Record(collection)` + `record.set(...)` +
`app.save(record)`.

## Seed in the create migration

`teams` is a deliberately PUBLIC leaderboard (anyone can read; nobody
can write from the frontend — `createRule` / `updateRule` / `deleteRule`
default to `null`, so only server-side superuser code or future
migrations can mutate). For user-owned data, default to owner-scoped
rules instead — see `ACCESS_RULES.md`.

```js
// apps/pocketbase/pb_migrations/1729500000_create_teams.js
/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const collection = new Collection({
      type: "base",
      name: "teams",
      listRule: "", // public leaderboard read
      viewRule: "", // public leaderboard read
      fields: [
        { name: "name", type: "text", required: true, max: 100 },
        { name: "wins", type: "number", onlyInt: true },
        { name: "losses", type: "number", onlyInt: true },
        { name: "points", type: "number", onlyInt: true },
      ],
    });
    app.save(collection);

    const seeds = [
      { name: "Red Hawks", wins: 0, losses: 0, points: 0 },
      { name: "Blue Sharks", wins: 0, losses: 0, points: 0 },
      { name: "Green Dragons", wins: 0, losses: 0, points: 0 },
    ];
    for (const data of seeds) {
      const r = new Record(collection);
      r.load(data); // equivalent to calling r.set(k, v) for each key
      app.save(r);
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("teams");
    app.delete(collection);
  },
);
```

## Seed in a separate later migration

```js
// apps/pocketbase/pb_migrations/1729500001_seed_products.js
/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const products = app.findCollectionByNameOrId("products");
    const brands = app.findCollectionByNameOrId("brands");

    const apple = app.findFirstRecordByData("brands", "name", "Apple");
    const samsung = app.findFirstRecordByData("brands", "name", "Samsung");

    const rows = [
      { name: "iPhone 15", brand: apple.id },
      { name: "Galaxy S24", brand: samsung.id },
    ];
    for (const data of rows) {
      const r = new Record(products);
      r.load(data);
      app.save(r);
    }
  },
  (app) => {
    // Clean up the seeded rows only
    for (const name of ["iPhone 15", "Galaxy S24"]) {
      try {
        const r = app.findFirstRecordByData("products", "name", name);
        app.delete(r);
      } catch (e) {
        if (e.message.includes("no rows in result set")) {
          console.log(`Product ${name} already gone, skipping cleanup`);
          continue;
        }
        throw e;
      }
    }
  },
);
```

## Seeding auth records (users, admins, staff)

Seed a user ONLY when the task explicitly asks for a demo/starter account —
never seed users by default. Use a strong password (never `macbookpro` /
`password123`) and reveal it to the user only in the final chat confirmation,
never in the app UI or committed docs. Because preview and published use
separate databases, always seed demo accounts via this migration (not a
runtime/dashboard create) so the account exists in BOTH environments; tell the
user the login works in both preview and the published site.

```js
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");

    const admin = new Record(users);
    admin.setEmail("andrius@example.com");
    // Generate a fresh strong password per project; never copy this literal.
    admin.setPassword("<generate-a-unique-strong-password>"); // hashes automatically
    admin.set("name", "Andrius");
    admin.set("role", "admin");
    admin.set("verified", true); // works even behind a verified-email gate
    app.save(admin);

    const staff1 = new Record(users);
    staff1.setEmail("tomas@example.com");
    staff1.setPassword("<generate-a-different-unique-strong-password>");
    staff1.set("name", "Tomas");
    staff1.set("role", "staff");
    staff1.set("verified", true);
    app.save(staff1);
  },
  (app) => {
    for (const email of ["andrius@example.com", "tomas@example.com"]) {
      try {
        const r = app.findAuthRecordByEmail("users", email);
        app.delete(r);
      } catch (e) {
        if (e.message.includes("no rows in result set")) {
          console.log(`User ${email} already gone, skipping cleanup`);
          continue;
        }
        throw e;
      }
    }
  },
);
```

## Seeding with relations across collections

```js
// apps/pocketbase/pb_migrations/1729500002_seed_books.js
/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const books = app.findCollectionByNameOrId("books");

    const orwell = app.findFirstRecordByData(
      "authors",
      "name",
      "George Orwell",
    );
    const secker = app.findFirstRecordByData(
      "publishers",
      "name",
      "Secker & Warburg",
    );

    const book = new Record(books);
    book.set("title", "1984");
    book.set("author", orwell.id);
    book.set("publisher", secker.id);
    book.set("year", 1949);

    app.save(book);
  },
  (app) => {
    try {
      const book = app.findFirstRecordByData("books", "title", "1984");
      app.delete(book);
    } catch (e) {
      if (e.message.includes("no rows in result set")) {
        console.log("Book 1984 already gone, skipping cleanup");
        return;
      }
      throw e;
    }
  },
);
```

If the author/publisher might not exist yet, either:

- Seed them in the same migration (order matters), or
- Use `findFirstRecordByData` inside a `try/catch` and create them first.

## The `_lookup` pattern (relations resolved by filter, not id)

When you don't have a single field that uniquely identifies the related
record (or the lookup needs an expression like `name = 'X' && season = 2`),
use `findFirstRecordByFilter`:

```js
migrate(
  (app) => {
    const courses = app.findCollectionByNameOrId("courses");

    const teacher = app.findFirstRecordByFilter(
      "teachers",
      "name = 'Dr. Sarah Johnson'",
    );
    if (!teacher) {
      throw new Error(
        "Lookup failed: teacher 'Dr. Sarah Johnson' not found — seed teachers first",
      );
    }

    const course = new Record(courses);
    course.set("name", "Calculus I");
    course.set("teacher", teacher.id);
    course.set("semester", "Fall 2025");

    app.save(course);
  },
  (app) => {
    // Clean up the seeded row by its identifying field.
    try {
      const r = app.findFirstRecordByFilter(
        "courses",
        "name = 'Calculus I' && semester = 'Fall 2025'",
      );
      app.delete(r);
    } catch (e) {
      if (e.message.includes("no rows in result set")) {
        console.log("Course already gone, skipping cleanup");
        return;
      }
      throw e;
    }
  },
);
```

Always throw a descriptive error when the lookup fails rather than silently
saving with an empty relation — the latter creates orphan rows that are
painful to debug later.

## Bulk insert (for 50+ rows)

Migrations already run in a transaction, so don't wrap seed loops in
`app.runInTransaction`.

```js
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("zipcodes");

    const rows = [
      /* 5000 objects */
    ];

    for (const data of rows) {
      const r = new Record(collection);
      r.load(data);
      app.save(r);
    }
  },
  (app) => {
    // Bulk seed → bulk wipe by the same id set in the down. Track the seeded
    // codes so the down only touches rows this migration created.
    const codes = [
      /* same primary keys as `rows` above */
    ];

    for (const code of codes) {
      try {
        const r = app.findFirstRecordByFilter("zipcodes", `code = '${code}'`);
        app.delete(r);
      } catch (e) {
        if (e.message.includes("no rows in result set")) {
          console.log(`Zipcode ${code} already gone, skipping cleanup`);
          continue;
        }
        throw e;
      }
    }
  },
);
```

## Common mistakes

- Calling `record.set("password", "raw")` — stores the raw string as the
  hash, breaks auth. Always `record.setPassword("raw")`.
- Setting a relation field to a record object instead of its `.id` string —
  PB expects the id string (or array of ids for multi-relations).
- Seeding data in the migration that creates an auth collection without
  enabling `passwordAuth` — the seeded user can't log in.
- Wrapping seed loops in `app.runInTransaction` inside a migration —
  migrations already run in a transaction.
- Seeding the same row twice across re-runs (though PB won't re-run an
  applied migration, development workflows sometimes delete `pb_data/`; make
  seeds idempotent with `findFirstRecordByData` + early return when
  possible).
