/// <reference path="../pb_data/types.d.ts" />

migrate(
	(app) => {
		const planos = app.findCollectionByNameOrId("planos_diarios");

		// tipo: diario | semana | mes — distingue plano do dia, da semana e calendário mensal.
		if (!planos.fields.getByName("tipo")) {
			planos.fields.add(
				new SelectField({
					name: "tipo",
					maxSelect: 1,
					values: ["diario", "semana", "mes"],
				}),
			);
		}

		// plano_completo: JSON com o plano estruturado completo (objetivo, briefing,
		// stories, reels, post_feed, ação comercial, meta do dia, checklist, roteiro).
		if (!planos.fields.getByName("plano_completo")) {
			planos.fields.add(
				new JSONField({ name: "plano_completo", maxSize: 500000 }),
			);
		}

		// titulo: rótulo curto para planos de semana/mês (ex.: "Semana de 25/08").
		if (!planos.fields.getByName("titulo")) {
			planos.fields.add(new TextField({ name: "titulo", max: 200 }));
		}

		app.save(planos);
	},
	(app) => {
		const planos = app.findCollectionByNameOrId("planos_diarios");
		for (const name of ["tipo", "plano_completo", "titulo"]) {
			if (planos.fields.getByName(name)) {
				planos.fields.removeByName(name);
			}
		}
		app.save(planos);
	},
);
