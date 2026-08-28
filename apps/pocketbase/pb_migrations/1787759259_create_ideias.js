/// <reference path="../pb_data/types.d.ts" />

migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");

		let ideias;
		try {
			ideias = app.findCollectionByNameOrId("ideias");
		} catch (_) {
			ideias = new Collection({
				type: "base",
				name: "ideias",
				listRule:
					"@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				viewRule:
					"@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				createRule: "@request.auth.id != '' && @request.auth.id = @request.body.owner",
				updateRule: "@request.auth.id != '' && @request.auth.id = owner",
				deleteRule: "@request.auth.id != '' && @request.auth.id = owner",
				fields: [
					{ name: "titulo", type: "text", required: true, max: 200 },
					{ name: "descricao", type: "text", max: 2000 },
					{
						name: "categoria",
						type: "select",
						maxSelect: 1,
						values: [
							"stories",
							"reels",
							"post",
							"acao_comercial",
							"relacionamento",
							"educacao",
							"promocao",
							"outro",
						],
					},
					{ name: "tags", type: "text", max: 200 },
					{
						name: "empresa",
						type: "relation",
						maxSelect: 1,
						collectionId: app.findCollectionByNameOrId("empresas").id,
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
					{ name: "reutilizada", type: "bool" },
					{ name: "created", type: "autodate", onCreate: true, onUpdate: false },
					{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
				],
				indexes: ["CREATE INDEX idx_ideias_owner ON ideias (owner)"],
			});
			app.save(ideias);
		}
	},
	(app) => {
		try {
			const collection = app.findCollectionByNameOrId("ideias");
			app.delete(collection);
		} catch (e) {
			if (e.message.includes("no rows in result set")) return;
			throw e;
		}
	},
);
