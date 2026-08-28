/// <reference path="../pb_data/types.d.ts" />

migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		const empresas = app.findCollectionByNameOrId("empresas");

		// 1. Add "geral" as a valid segmento option (onboarding conversacional uses
		//    "saude" or "geral"; "negocio_local" is kept for backward compatibility).
		const segmentoField = empresas.fields.getByName("segmento");
		if (segmentoField) {
			const values = segmentoField.values || [];
			if (!values.includes("geral")) {
				segmentoField.values = [...values, "geral"];
			}
			app.save(empresas);
		}

		// 2. Add the new onboarding fields to empresas (idempotent).
		const addTextField = (name, max) => {
			if (empresas.fields.getByName(name)) return;
			empresas.fields.add(new TextField({ name, max: max || 0 }));
		};

		addTextField("estado", 120);
		addTextField("instagram", 120);
		addTextField("whatsapp", 120);
		addTextField("perfil_pacientes", 1000);
		addTextField("objetivos_crescimento", 1000);
		addTextField("produtos_servicos", 2000);
		addTextField("objetivos", 1000);
		addTextField("promocoes_atuais", 1000);

		if (!empresas.fields.getByName("onboarding_completo")) {
			empresas.fields.add(new BoolField({ name: "onboarding_completo" }));
		}

		if (!empresas.fields.getByName("onboarding_respostas")) {
			empresas.fields.add(new JSONField({ name: "onboarding_respostas", maxSize: 200000 }));
		}

		app.save(empresas);

		// 3. mensagens_chat — log of the conversational onboarding (and future chat).
		let mensagens;
		try {
			mensagens = app.findCollectionByNameOrId("mensagens_chat");
		} catch (_) {
			mensagens = new Collection({
				type: "base",
				name: "mensagens_chat",
				listRule:
					"@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				viewRule:
					"@request.auth.id != '' && (@request.auth.id = owner || @request.auth.role = 'admin')",
				createRule: "@request.auth.id != '' && @request.auth.id = @request.body.owner",
				updateRule: "@request.auth.id != '' && @request.auth.id = owner",
				deleteRule: "@request.auth.id != '' && @request.auth.id = owner",
				fields: [
					{
						name: "empresa",
						type: "relation",
						maxSelect: 1,
						collectionId: empresas.id,
						cascadeDelete: false,
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
						name: "remetente",
						type: "select",
						required: true,
						maxSelect: 1,
						values: ["usuario", "ia"],
					},
					{ name: "conteudo", type: "text", required: true, max: 4000 },
					{ name: "created", type: "autodate", onCreate: true, onUpdate: false },
					{ name: "updated", type: "autodate", onCreate: true, onUpdate: true },
				],
				indexes: [
					"CREATE INDEX idx_mensagens_chat_owner ON mensagens_chat (owner)",
					"CREATE INDEX idx_mensagens_chat_empresa ON mensagens_chat (empresa)",
				],
			});
			app.save(mensagens);
		}
	},
	(app) => {
		// Drop mensagens_chat.
		try {
			const mensagens = app.findCollectionByNameOrId("mensagens_chat");
			app.delete(mensagens);
		} catch (e) {
			if (!e.message.includes("no rows in result set")) throw e;
		}

		// Remove added fields from empresas.
		const empresas = app.findCollectionByNameOrId("empresas");
		for (const name of [
			"estado",
			"instagram",
			"whatsapp",
			"perfil_pacientes",
			"objetivos_crescimento",
			"produtos_servicos",
			"objetivos",
			"promocoes_atuais",
			"onboarding_completo",
			"onboarding_respostas",
		]) {
			if (empresas.fields.getByName(name)) {
				empresas.fields.removeByName(name);
			}
		}

		// Remove "geral" from segmento values.
		const segmentoField = empresas.fields.getByName("segmento");
		if (segmentoField) {
			segmentoField.values = (segmentoField.values || []).filter((v) => v !== "geral");
		}
		app.save(empresas);
	},
);
