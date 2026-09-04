/// <reference path="../pb_data/types.d.ts" />

// Notificações por e-mail do Meu CMO.
// Usa o mailer embutido do PocketBase ($app.newMailClient()).
// Envoltório em try/catch para nunca abortar a operação de registro.
//
// IMPORTANTE: o JSVM do PocketBase executa cada callback em um escopo isolado
// e NÃO enxerga funções/variáveis declaradas no escopo externo do arquivo.
// Por isso brandHeader() e brandFooter() são (re)definidas dentro de cada
// callback que as utiliza.

// 1. Plano do dia pronto — disparado quando um novo plano diário é criado.
onRecordAfterCreateSuccess((e) => {
	const tipo = e.record.getString("tipo");
	if (tipo && tipo !== "diario") {
		e.next();
		return;
	}

	const ownerId = e.record.get("owner");
	if (!ownerId) {
		e.next();
		return;
	}

	const brandHeader = (title) => `
		<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
			<div style="background:#0d7d6e;padding:20px 24px;display:flex;align-items:center;gap:10px">
				<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:#fff;color:#0d7d6e;font-weight:800;font-family:Sora,Arial,sans-serif">M</span>
				<span style="color:#fff;font-weight:700;font-size:18px;font-family:Sora,Arial,sans-serif">Meu CMO</span>
			</div>
			<div style="padding:24px">
				<h1 style="font-size:20px;margin:0 0 12px;color:#111827">${title}</h1>
	`;

	const brandFooter = () => `
				<p style="margin-top:24px;font-size:12px;color:#6b7280">Meu CMO — seu gerente de marketing com IA.</p>
				<p style="font-size:12px;color:#9ca3af">Você recebe este e-mail porque tem uma conta no Meu CMO. Para desativar avisos, ajuste suas preferências em Configurações.</p>
			</div>
		</div>
	`;

	try {
		const user = $app.findRecordById("users", ownerId);
		const email = user.getString("email");
		if (!email) {
			e.next();
			return;
		}

		const foco = e.record.getString("foco") || "seu plano de marketing do dia";
		const resumo = e.record.getString("resumo") || "";
		const appUrl = $app.settings().meta.appURL;
		const dashboardLink = appUrl + "/dashboard";

		const message = new MailerMessage({
			from: { name: "Meu CMO" },
			to: [{ address: email }],
			subject: "Seu plano do dia está pronto 🎬",
			html:
				brandHeader("Seu plano do dia está pronto") +
				`<p style="font-size:15px;color:#374151;line-height:1.6">Olá! Seu CMO já preparou o plano de marketing de hoje.</p>
				 <p style="font-size:15px;color:#374151;line-height:1.6"><strong>Foco do dia:</strong> ${foco}</p>
				 ${resumo ? `<p style="font-size:14px;color:#6b7280;line-height:1.6">${resumo.slice(0, 280)}</p>` : ""}
				 <p style="margin-top:20px"><a href="${dashboardLink}" style="display:inline-block;background:#0d7d6e;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Ver meu plano</a></p>` +
				brandFooter(),
		});

		try {
			$app.newMailClient().send(message);
		} catch (err) {
			$app.logger().error("plano-pronto email failed", "to", email, "err", String(err));
		}
	} catch (err) {
		$app.logger().error("plano-pronto hook failed", "err", String(err));
	}

	e.next();
}, "planos_diarios");

// 2. Boas-vindas — disparado quando um novo usuário é criado.
onRecordAfterCreateSuccess((e) => {
	const email = e.record.getString("email");
	if (!email) {
		e.next();
		return;
	}
	const nome = e.record.getString("name") || "";

	const brandHeader = (title) => `
		<div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden">
			<div style="background:#0d7d6e;padding:20px 24px;display:flex;align-items:center;gap:10px">
				<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:8px;background:#fff;color:#0d7d6e;font-weight:800;font-family:Sora,Arial,sans-serif">M</span>
				<span style="color:#fff;font-weight:700;font-size:18px;font-family:Sora,Arial,sans-serif">Meu CMO</span>
			</div>
			<div style="padding:24px">
				<h1 style="font-size:20px;margin:0 0 12px;color:#111827">${title}</h1>
	`;

	const brandFooter = () => `
				<p style="margin-top:24px;font-size:12px;color:#6b7280">Meu CMO — seu gerente de marketing com IA.</p>
				<p style="font-size:12px;color:#9ca3af">Você recebe este e-mail porque tem uma conta no Meu CMO. Para desativar avisos, ajuste suas preferências em Configurações.</p>
			</div>
		</div>
	`;

	try {
		const appUrl = $app.settings().meta.appURL;
		const message = new MailerMessage({
			from: { name: "Meu CMO" },
			to: [{ address: email }],
			subject: "Bem-vindo ao Meu CMO 🚀",
			html:
				brandHeader("Bem-vindo ao Meu CMO") +
				`<p style="font-size:15px;color:#374151;line-height:1.6">Olá${nome ? ", " + nome : ""}! Sua IA gerente de marketing já está pronta para trabalhar.</p>
				 <p style="font-size:15px;color:#374151;line-height:1.6">Em minutos você terá seu primeiro plano do dia: o que postar, a ação comercial e um roteiro de vídeo pronto para gravar.</p>
				 <p style="margin-top:20px"><a href="${appUrl}/onboarding" style="display:inline-block;background:#0d7d6e;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Começar agora</a></p>` +
				brandFooter(),
		});
		try {
			$app.newMailClient().send(message);
		} catch (err) {
			$app.logger().error("welcome email failed", "to", email, "err", String(err));
		}
	} catch (err) {
		$app.logger().error("welcome hook failed", "err", String(err));
	}

	e.next();
}, "users");
