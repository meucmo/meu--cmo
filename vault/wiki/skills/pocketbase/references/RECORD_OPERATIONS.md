---
name: pocketbase-record-operations
description: >
  PocketBase JSVM record helpers for hooks and migrations: typed getters,
  fetching records, and expanding relation fields with `expandRecord`.
  Load when server-side code needs to read related records or inspect record
  fields before saving, emailing, validating, or backfilling data.
---

# Record Operations

Use these helpers inside PocketBase JS files (`pb_hooks/*.pb.js` and
`pb_migrations/*.js`). The examples mirror PocketBase's JavaScript record
operations docs: https://pocketbase.io/docs/js-records/

## Two contexts, two names for the app — do not copy across them

The same methods are reached through a different identifier depending on the
file, and using the wrong one is a `ReferenceError` that never runs:

| File                  | The app is…                       |
| --------------------- | --------------------------------- |
| `pb_hooks/*.pb.js`    | the global `$app`                 |
| `pb_migrations/*.js`  | the callback parameter, `app`     |

`$app` is bound only for hooks, so a migration that says `$app.` throws
`ReferenceError: $app is not defined` and aborts the whole batch. The examples
below are written in the hooks form; in a migration, drop the `$` and take the
app from the callback:

```js
// pb_migrations/1729500000_backfill.js
migrate(
  (app) => {
    const record = app.findRecordById("articles", "RECORD_ID"); // NOT $app
  },
  (app) => {},
);
```

## Methods that do not exist

These are the most frequent `TypeError: Object has no member 'x'` failures. In a
migration each one aborts the batch, so PocketBase refuses to start; in a hook it
fails that single event or request.

| Wrong                              | Correct                                                     |
| ---------------------------------- | ----------------------------------------------------------- |
| `record.getId()`                   | `record.id` (works on records and fields alike)             |
| `record.save()`                    | `app.save(record)` — records do not save themselves         |
| `app.findRecordsByCollection(c)`   | `app.findAllRecords(c)` / `app.findRecordsByFilter(...)`     |
| `record.setUsername(x)`            | removed in PB 0.23 — `username` is not a built-in auth field |

`record.get()` returns the raw Go value, not a JS primitive: a string list has
`.slice` but no `.split`, and a datetime is not a JS `Date`. Use the typed
getters below, and clone JSON values with
`JSON.parse(JSON.stringify(value))` before mutating them.

## Read Field Values

```js
record.get("someField"); // any, without cast
record.getBool("someField");
record.getString("someField");
record.getInt("someField");
record.getFloat("someField");
record.getDateTime("someField");
record.getStringSlice("someField");
```

Prefer typed getters when the value drives logic (`getInt`, `getBool`,
`getDateTime`, etc.). For strings, `getString("field")` is usually the
clearest choice.

Auth records also have convenience accessors like `record.email()`, but
`record.getString("email")` works consistently for both auth and base
collections.

## Fetch Records

Single-record helpers throw when no record is found.

```js
// Hooks form. In a pb_migrations file these are `app.` — see the table above.
// Retrieve a single "articles" record by id.
const record = $app.findRecordById("articles", "RECORD_ID");

// Retrieve a single "articles" record by field value.
const article = $app.findFirstRecordByData("articles", "slug", "test");

// Retrieve a single record by filter. Use placeholders for untrusted input.
const publicArticle = $app.findFirstRecordByFilter(
  "articles",
  "status = 'public' && category = {:category}",
  { category: "news" },
);
```

Multiple-record helpers return an empty array when no records are found.

```js
const records = $app.findRecordsByFilter(
  "articles",
  "status = 'public' && category = {:category}",
  "-published",
  10,
  0,
  { category: "news" },
);
```

## Expand Relations

To read related records in JSVM code, expand the record first, then use
`expandedOne` or `expandedAll`.

```js
// Hooks form. In a pb_migrations file these are `app.` — see the table above.
const record = $app.findFirstRecordByData("articles", "slug", "lorem-ipsum");

$app.expandRecord(record, ["author", "categories"], null);

const author = record.expandedOne("author");
const categories = record.expandedAll("categories");
```

For a hook event, prefer the record you already have:

```js
onRecordAfterCreateSuccess((e) => {
  const performance = e.record;

  $app.expandRecord(performance, ["runner", "race"], null);

  const runner = performance.expandedOne("runner");
  const race = performance.expandedOne("race");

  const recipientEmail = runner ? runner.getString("email") : "";
  const raceName = race ? race.getString("name") : "Unknown Race";

  // ...

  e.next();
}, "performances");
```

## Common Mistake: REST-Style Expand Options

Do not pass REST/SDK-style `{ expand: "..." }` options to
`$app.findRecordById`. In PocketBase JSVM this third argument is not an
options object; using one throws a `TypeError` like:

```text
could not convert [object Object] to func(*dbx.SelectQuery) error
```

```js
// WRONG — findRecordById does not accept REST-style expand options.
const rec = $app.findRecordById("performances", id, {
  expand: "runner,race",
});

// CORRECT — fetch or use the record, then expand it in-place.
const performance = e.record;

$app.expandRecord(performance, ["runner", "race"], null);

const runner = performance.expandedOne("runner");
const race = performance.expandedOne("race");
```

`expandedOne("rel")` returns `null` until the relation has been expanded.
Always call `$app.expandRecord(record, ["rel"], null)` before reading expanded
relations.
