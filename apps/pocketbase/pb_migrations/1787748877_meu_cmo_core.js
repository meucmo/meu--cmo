/// <reference path="../pb_data/types.d.ts" />

migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");

		// Role field + admin read access on users (admin panel).
		if (!users.fields.getByName("role")) {
			users.fields.add(
				new SelectField({
					name: "role",
					maxSelect: 1,
					values: ["customer", "admin"],
				}),
			);
		}
		users.listRule = "id = @request.auth.id || @request.auth.role = 'admin'";
		users.viewRule = "id = @request.auth.id || @request.auth.role = 'admin'";
		app.save(users);

		// empresas — one business per owner (MVP), with the customizable AI assistant name.
		let empresas;
		try {
			empresas = app.findCollectionByNameOrId("empresas");
		} catch (_) {
			empresas = new Collection({
				type: "base",
				name: "empresas",
				listRule: "@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				viewRule: "@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				createRule: "@request.auth.id != '' && @request.auth.id = @request.body.owner",
				updateRule: "@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				deleteRule: "@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				fields: [
					{ name: "nome", type: "text", required: true, max: 120 },
					{
						name: "segmento",
						type: "select",
						required: true,
						maxSelect: 1,
						values: ["negocio_local", "saude"],
					},
					{ name: "especialidade", type: "text", max: 120 },
					{ name: "cidade", type: "text", max: 120 },
					{ name: "publico_alvo", type: "text", max: 200 },
					{ name: "descricao", type: "text", max: 1000 },
					{ name: "assistente_nome", type: "text", required: true, max: 60 },
					{
						name: "tom_de_voz",
						type: "select",
						maxSelect: 1,
						values: ["profissional", "descontraido", "acolhedor", "tecnico"],
					},
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
				indexes: ["CREATE INDEX idx_empresas_owner ON empresas (owner)"],
			});
			app.save(empresas);
		}

		// planos_diarios — the AI-generated daily marketing plan per company.
		let planos;
		try {
			planos = app.findCollectionByNameOrId("planos_diarios");
		} catch (_) {
			planos = new Collection({
				type: "base",
				name: "planos_diarios",
				listRule: "@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				viewRule: "@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				createRule: "@request.auth.id != '' && @request.auth.id = @request.body.owner",
				updateRule: "@request.auth.id != '' && @request.auth.id = owner",
				deleteRule: "@request.auth.id != '' && @request.auth.id = owner",
				fields: [
					{
						name: "empresa",
						type: "relation",
						required: true,
						maxSelect: 1,
						collectionId: empresas.id,
						cascadeDelete: true,
					},
					{
						name: "owner",
						type: "relation",
						required: true,
						maxSelect: 1,
						collectionId: users.id,
						cascadeDelete: true,
					},
					{ name: "data", type: "text", required: true, max: 10 },
					{ name: "foco", type: "text", max: 200 },
					{ name: "resumo", type: "text", max: 1000 },
					{ name: "roteiro_video", type: "json", maxSize: 200000 },
					{ name: "created", type: "autodate", onCreate: true, onUpdate: false },
					{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
				],
				indexes: [
					"CREATE UNIQUE INDEX idx_planos_diarios_empresa_data ON planos_diarios (empresa, data)",
					"CREATE INDEX idx_planos_diarios_owner ON planos_diarios (owner)",
				],
			});
			app.save(planos);
		}

		// tarefas — actionable items of a daily plan (stories, reels, posts, commercial actions).
		try {
			app.findCollectionByNameOrId("tarefas");
		} catch (_) {
			const tarefas = new Collection({
				type: "base",
				name: "tarefas",
				listRule: "@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				viewRule: "@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				createRule: "@request.auth.id != '' && @request.auth.id = @request.body.owner",
				updateRule: "@request.auth.id != '' && @request.auth.id = owner",
				deleteRule: "@request.auth.id != '' && @request.auth.id = owner",
				fields: [
					{
						name: "plano",
						type: "relation",
						required: true,
						maxSelect: 1,
						collectionId: planos.id,
						cascadeDelete: true,
					},
					{
						name: "empresa",
						type: "relation",
						required: true,
						maxSelect: 1,
						collectionId: empresas.id,
						cascadeDelete: true,
					},
					{
						name: "owner",
						type: "relation",
						required: true,
						maxSelect: 1,
						collectionId: users.id,
						cascadeDelete: true,
					},
					{
						name: "tipo",
						type: "select",
						required: true,
						maxSelect: 1,
						values: ["stories", "reels", "post", "acao_comercial", "relacionamento", "educacao"],
					},
					{ name: "titulo", type: "text", required: true, max: 200 },
					{ name: "descricao", type: "text", max: 1000 },
					{ name: "concluida", type: "bool" },
					{ name: "ordem", type: "number", onlyInt: true },
					{ name: "created", type: "autodate", onCreate: true, onUpdate: false },
					{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
				],
				indexes: [
					"CREATE INDEX idx_tarefas_plano ON tarefas (plano)",
					"CREATE INDEX idx_tarefas_owner ON tarefas (owner)",
				],
			});
			app.save(tarefas);
		}
	},
	(app) => {
		for (const name of ["tarefas", "planos_diarios", "empresas"]) {
			try {
				const collection = app.findCollectionByNameOrId(name);
				app.delete(collection);
			} catch (e) {
				if (e.message.includes("no rows in result set")) {
					continue;
				}
				throw e;
			}
		}

		const users = app.findCollectionByNameOrId("users");
		if (users.fields.getByName("role")) {
			users.fields.removeByName("role");
		}
		users.listRule = "id = @request.auth.id";
		users.viewRule = "id = @request.auth.id";
		app.save(users);
	},
);
