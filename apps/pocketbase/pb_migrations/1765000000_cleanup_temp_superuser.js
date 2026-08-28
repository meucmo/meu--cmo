/// <reference path="../pb_data/types.d.ts" />

// Runs immediately after 1764579159_create_superuser.js.
//
// 1760000000_dedupe_superuser.js renamed the pre-existing superuser's email to
// a temporary value so 1764579159_create_superuser.js could insert a fresh
// record with PB_SUPERUSER_EMAIL. Now that the env-email superuser exists, we
// delete the renamed stray. We only delete the temp record once we confirm the
// env-email superuser is present, so we never end up with zero superusers.
migrate(
  (app) => {
    const email = $os.getenv("PB_SUPERUSER_EMAIL");
    const tempEmail = "cmo-temp-rename-1760000000@example.com";
    const superusers = app.findCollectionByNameOrId("_superusers");

    // Confirm the env-email superuser exists before removing the temp one.
    if (email) {
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
      if (envExisting.length === 0) {
        // The create migration did not produce the env-email superuser; keep
        // the temp one to avoid a zero-superuser state.
        return;
      }
    }

    let temp = [];
    try {
      temp = app.findRecordsByFilter(
        superusers.id,
        "email = {:email}",
        "",
        0,
        0,
        { email: tempEmail },
      );
    } catch (_) {
      return;
    }
    for (const record of temp) {
      app.delete(record);
    }
  },
  (app) => {
    // No-op: re-creating the stray on rollback would just reintroduce the
    // original duplicate-email conflict. The env-email superuser remains.
  },
);
