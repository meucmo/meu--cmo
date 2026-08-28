/// <reference path="../pb_data/types.d.ts" />

// Runs immediately before 1764579159_create_superuser.js.
//
// The superuser is provisioned by entrypoint.sh on container start, so by the
// time 1764579159_create_superuser.js runs, a record with PB_SUPERUSER_EMAIL
// already exists and the create throws "email: Value must be unique".
//
// We cannot delete that record (PocketBase refuses to delete the only
// superuser) and we cannot edit the read-only create migration. So instead we
// RENAME the existing superuser's email to a temporary value. That clears the
// env-email slot so 1764579159_create_superuser.js can insert its own record
// with PB_SUPERUSER_EMAIL / PB_SUPERUSER_PASSWORD. A follow-up migration
// (1765000000_cleanup_temp_superuser.js) then removes the renamed stray,
// leaving exactly one superuser with the env credentials.
migrate(
  (app) => {
    const email = $os.getenv("PB_SUPERUSER_EMAIL");
    if (!email) {
      // Nothing we can do without the env email; let the create migration
      // surface the missing-env failure itself. Do not mask it.
      return;
    }

    const superusers = app.findCollectionByNameOrId("_superusers");
    let existing = [];
    try {
      existing = app.findRecordsByFilter(
        superusers.id,
        "email = {:email}",
        "",
        0,
        0,
        { email },
      );
    } catch (_) {
      // No matching record — the create migration will create one cleanly.
      return;
    }

    const tempEmail = "cmo-temp-rename-1760000000@example.com";
    for (const record of existing) {
      record.set("email", tempEmail);
      app.save(record);
    }
  },
  (app) => {
    // Rollback: rename the temp superuser back to the env email, but only if
    // no record currently holds the env email (otherwise we'd create a
    // duplicate). Best-effort — down is a safety net, not a guarantee.
    const email = $os.getenv("PB_SUPERUSER_EMAIL");
    if (!email) return;
    const superusers = app.findCollectionByNameOrId("_superusers");
    let envExisting = [];
    try {
      envExisting = app.findRecordsByFilter(
        superusers.id,
        "email = {:email}",
        "",
        0,
        0,
        { email },
      );
    } catch (_) {
      /* ignore */
    }
    if (envExisting.length > 0) return; // env-email slot already occupied

    let temp = [];
    try {
      temp = app.findRecordsByFilter(
        superusers.id,
        "email = {:email}",
        "",
        0,
        0,
        { email: "cmo-temp-rename-1760000000@example.com" },
      );
    } catch (_) {
      return;
    }
    for (const record of temp) {
      record.set("email", email);
      app.save(record);
    }
  },
);
