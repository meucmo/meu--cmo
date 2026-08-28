/**
 * Exemplos de plano do dia (Parte 1 do documento mestre) + validação de formato.
 *
 * Dois casos de teste prontos:
 *  1. Barbearia do Zé (Recife-PE) — negócio local
 *  2. Consultório de Nutrição — Modo Saúde
 *
 * Usados pela página /exemplos para validar se a IA está gerando planos
 * exatamente no formato da Parte 1 (seções 2 e 3).
 */

// ---------------------------------------------------------------------------
// EXEMPLO 1 — Barbearia do Zé (negócio local)
// ---------------------------------------------------------------------------

export const EXEMPLO_BARBEARIA = {
	cadastro: {
		nome: 'Barbearia do Zé',
		segmento: 'negocio_local',
		especialidade: 'Corte masculino e barba',
		cidade: 'Recife',
		estado: 'PE',
		instagram: '@barbeariadoze',
		whatsapp: '(81) 99999-1234',
		publico_alvo: 'Homens 18 a 45 anos, bairros de classe média',
		objetivos: 'Atrair clientes novos e fidelizar a clientela',
		promocoes_atuais: 'Promoção corte + barba por R$ 45 (até sábado)',
		assistente_nome: 'Zé CMO',
		tom_de_voz: 'descontraido',
	},
	plano: {
		objetivo: 'Lotar a agenda de sábado com a promoção corte + barba',
		briefing:
			'Hoje é quinta-feira, o dia ideal para começar a vender a agenda do fim de semana. O foco é transformar a promoção corte + barba em motivo real para o cliente agendar agora, usando prova social e urgência leve (vagas limitadas por horário).',
		stories: {
			horario: '12h e 19h',
			o_que_gravar:
				'Mostre a barbearia movimentada, um corte sendo finalizado e a plaque de preços da promoção. Grave um cliente saindo satisfeito (com autorização).',
			texto: 'Quinta é dia de garantir o sábado 🔥 Corte + barba R$45',
			cta: 'Chama no WhatsApp e agenda seu horário',
		},
		reels: {
			horario: '19h30',
			tema: 'Antes e depois de um cliente com barba desalinhada',
			gancho: 'Você tá com essa barba aí e ainda acha que tá bom?',
			legenda:
				'Tem gente que demora pra ver a diferença de um corte bem feito. Marca teu sábado aqui na Barbearia do Zé — corte + barba R$45 só até sábado. Chama no WhatsApp e garante teu horário. 🔥💈',
			hashtags: ['#barbearia', '#barbeariarecife', '#cortebarba', '#barbeariadoze', '#recife'],
		},
		post_feed: {
			ideia_imagem:
				'Carrossel de 3 fotos: 1) fachada da barbearia, 2) cliente no meio do corte, 3) resultado final com a plaque da promoção ao lado.',
			texto:
				'Sábado tá chegando e a agenda tá enchendo. Garante teu corte + barba por R$45 só até sábado. Vagas por horário — chama no WhatsApp e marca a tua. 💈',
			cta: 'Agende pelo WhatsApp (81) 99999-1234',
		},
		acao_comercial:
			'Mande mensagem no WhatsApp para 15 clientes que não voltam há mais de 60 dias oferecendo a promoção corte + barba com horário marcado.',
		acao_extra:
			'Peça para 3 clientes satisfeitos de hoje marcarem a barbearia no Instagram nas próprias stories — reponha cada marcação com um agradecimento.',
		meta_do_dia: {
			leads: '8 novos contatos no WhatsApp',
			conversas: '15 conversas iniciadas',
			agendamentos: '10 horários marcados para sábado',
			vendas: '6 cortes + barba confirmados',
		},
		checklist_ontem: [
			'Postou stories mostrando o ambiente da barbearia',
			'Repondeu a marcação de 2 clientes no Instagram',
			'Fez a limpeza e organização das estações ao fim do dia',
		],
		roteiro_video: {
			titulo: 'A barba que tá passando despercebida',
			duracao_segundos: 30,
			formato: 'vertical 9:16',
			cenas: [
				{
					nome: 'GANCHO',
					tempo: '0-3s',
					fala: 'Você tá com essa barba aí e ainda acha que tá bom?',
					acao: 'Primeiro plano no rosto do cliente com barba desalinhada, expressão de dúvida.',
				},
				{
					nome: 'DESENVOLVIMENTO',
					tempo: '3-15s',
					fala: 'Aqui na Barbearia do Zé a gente alinha a barba do jeito que combina com teu rosto, sem pressa, no capricho.',
					acao: 'Corte em movimento: barbeador deslizando, mãos do barbeiro trabalhando, close no acabamento.',
				},
				{
					nome: 'ENTREGA DE VALOR',
					tempo: '15-25s',
					fala: 'Olha o resultado. Isso aqui é o que a gente chama de corte + barba de verdade.',
					acao: 'Cliente finalizado sorrindo, espelho na mão, corte e barba alinhados.',
				},
				{
					nome: 'CTA FINAL',
					tempo: '25-30s',
					fala: 'Sábado tá chegando e a promoção corte + barba tá R$45. Chama no WhatsApp e garante teu horário.',
					acao: 'Plaque da promoção em close + logo da barbearia + número do WhatsApp na tela.',
				},
			],
			audio: 'Áudio em alta: funk suave ou samba de raiz recifense, ritmo marcado para cortes rápidos.',
			texto_tela: 'Corte + Barba R$45 — só até sábado',
			dica_gravacao:
				'Grave com luz natural perto da janela, celular na altura dos olhos do cliente. Faça 2 tomadas do gancho para escolher a melhor na edição.',
		},
		tarefas: [
			{ tipo: 'stories', titulo: 'Stories da promoção corte + barba', descricao: 'Grave 2 stories às 12h e 19h mostrando a barbearia e a plaque da promoção.' },
			{ tipo: 'reels', titulo: 'Gravar Reels antes e depois', descricao: 'Use o roteiro "A barba que tá passando despercebida". Poste às 19h30.' },
			{ tipo: 'post', titulo: 'Carrossel da promoção no feed', descricao: 'Publique 3 fotos (fachada, corte, resultado) com a legenda pronta.' },
			{ tipo: 'acao_comercial', titulo: 'Reativar 15 clientes antigos no WhatsApp', descricao: 'Mande a oferta corte + barba para quem não volta há 60+ dias.' },
			{ tipo: 'relacionamento', titulo: 'Repostar marcações de clientes', descricao: 'Reponha 3 stories de clientes satisfeitos agradecendo pela marcação.' },
			{ tipo: 'educacao', titulo: 'Dica rápida de cuidado com a barba', descricao: 'Grave um story de 15s explicando como hidratar a barba entre cortes.' },
		],
	},
};

// ---------------------------------------------------------------------------
// EXEMPLO 2 — Consultório de Nutrição (Modo Saúde)
// ---------------------------------------------------------------------------

export const EXEMPLO_NUTRICAO = {
	cadastro: {
		nome: 'Consultório de Nutrição Dra. Ana',
		segmento: 'saude',
		especialidade: 'Nutrição clínica — emagrecimento saudável',
		cidade: 'São Paulo',
		estado: 'SP',
		instagram: '@draananutri',
		whatsapp: '(11) 98888-5678',
		publico_alvo: 'Mulheres 30 a 55 anos buscando emagrecimento com saúde',
		objetivos: 'Aumentar agendamentos de primeira consulta',
		promocoes_atuais: 'Vagas para primeira consulta com avaliação completa',
		assistente_nome: 'Ana CMO',
		tom_de_voz: 'acolhedor',
	},
	plano: {
		objetivo: 'Educar sobre emagrecimento saudável e convidar à primeira consulta',
		briefing:
			'Hoje o foco é construir autoridade e confiança antes de qualquer convite ao agendamento. O conteúdo educa sobre mitos do emagrecimento, humaniza a profissional e só ao final convida, de forma sutil e ética, para a primeira consulta. Nada de promessa de resultado.',
		stories: {
			horario: '11h e 18h',
			o_que_gravar:
				'Mostre o consultório organizado, a profissional revisando um plano alimentar e um quadro com 3 mitos do emagrecimento. Mantenha tom calmo e didático.',
			texto: 'Emagrecer com saúde existe — e começa com informação certa',
			cta: 'Tem dúvida sobre emagrecimento? Manda nos comentários',
		},
		reels: {
			horario: '20h',
			tema: '3 mitos sobre emagrecimento que atrapalham mais do que ajudam',
			gancho: 'Você já tentou cortar carboidrato e não viu resultado? Calma, não é só isso.',
			legenda:
				'Emagrecimento saudável não tem fórmula mágica — tem estratégia individual. Cada corpo responde de um jeito, e o acompanhamento profissional existe justamente pra isso. Se você tem dúvidas, deixa nos comentários. 💚',
			hashtags: ['#nutricao', '#emagrecimentosaudavel', '#nutricaoclinica', '#saudemulher', '#draananutri'],
		},
		post_feed: {
			ideia_imagem:
				'Carrossel educativo de 4 slides: capa "3 mitos do emagrecimento", um mito por slide com a explicação correta, e slide final com convite sutil à consulta.',
			texto:
				'Mito 1: cortar carboidrato sozinho emagrece. Mito 2: comer de noite engorda por si só. Mito 3: suco detox resolve tudo. A verdade é que o emagrecimento saudável depende de um plano alimentar individualizado, acompanhado por um profissional. Tem dúvida? A gente te ajuda a entender o seu caso.',
			cta: 'Agende uma primeira consulta para uma avaliação completa',
		},
		acao_comercial:
			'Responda pessoalmente os comentários e mensagens do dia com acolhimento, esclarecendo dúvidas e, quando fizer sentido, convidando para a primeira consulta — sem pressão.',
		acao_extra:
			'Grave um story respondendo a uma pergunta real de seguidora sobre emagrecimento, mostrando o cuidado individualizado da consulta.',
		meta_do_dia: {
			leads: '5 novas mensagens com dúvidas',
			conversas: '8 conversas educativas',
			agendamentos: '3 primeiras consultas agendadas',
			vendas: '3 avaliações completas confirmadas',
		},
		checklist_ontem: [
			'Postou carrossel educativo sobre hidratação',
			'Respondeu a 4 comentários de seguidoras',
			'Revisou os planos alimentares de 2 pacientes em acompanhamento',
		],
		roteiro_video: {
			titulo: '3 mitos do emagrecimento que te confundem',
			duracao_segundos: 30,
			formato: 'vertical 9:16',
			cenas: [
				{
					nome: 'GANCHO',
					tempo: '0-3s',
					fala: 'Você já tentou cortar carboidrato e não viu resultado? Calma, não é só isso.',
					acao: 'Primeiro plano da profissional olhando para a câmera, expressão acolhedora e calma.',
				},
				{
					nome: 'DESENVOLVIMENTO',
					tempo: '3-15s',
					fala: 'Existem 3 mitos que atrapalham mais do que ajudam: cortar carboidrato sozinho, achar que comer de noite engorda e acreditar em suco detox milagroso.',
					acao: 'Aparecem na tela os 3 mitos em texto, um por vez, enquanto a profissional fala.',
				},
				{
					nome: 'ENTREGA DE VALOR',
					tempo: '15-25s',
					fala: 'O emagrecimento saudável depende de um plano alimentar feito pra você, acompanhado de perto por um profissional.',
					acao: 'Profissional no consultório, mostrando um plano alimentar individualizado, tom didático e tranquilo.',
				},
				{
					nome: 'CTA FINAL',
					tempo: '25-30s',
					fala: 'Se você tem dúvidas sobre o seu caso, deixa nos comentários. E se quiser uma avaliação completa, é só chamar no WhatsApp.',
					acao: 'Logo do consultório + número do WhatsApp na tela, sem promessa de resultado.',
				},
			],
			audio: 'Áudio calmo e suave, trilha instrumental leve — sem batidas fortes, mantém o tom acolhedor.',
			texto_tela: 'Emagrecimento saudável é individual',
			dica_gravacao:
				'Grave no consultório com luz suave. Fale devagar, pausando entre os mitos. Mantenha expressão acolhedora o tempo todo — nada de tom de venda.',
		},
		tarefas: [
			{ tipo: 'stories', titulo: 'Stories educativos sobre emagrecimento', descricao: 'Grave 2 stories às 11h e 18h com tom didático e calmo.' },
			{ tipo: 'reels', titulo: 'Reels 3 mitos do emagrecimento', descricao: 'Use o roteiro "3 mitos do emagrecimento que te confundem". Poste às 20h.' },
			{ tipo: 'post', titulo: 'Carrossel educativo no feed', descricao: 'Publique 4 slides com mitos e explicação correta, convite sutil ao final.' },
			{ tipo: 'acao_comercial', titulo: 'Responder comentários e mensagens com acolhimento', descricao: 'Esclareça dúvidas e convide à primeira consulta sem pressão.' },
			{ tipo: 'relacionamento', titulo: 'Story respondendo pergunta de seguidora', descricao: 'Mostre o cuidado individualizado da consulta ao responder uma dúvida real.' },
			{ tipo: 'educacao', titulo: 'Dica de hidratação e alimentação consciente', descricao: 'Grave um story curto explicando a importância de beber água ao longo do dia.' },
		],
	},
};

export const EXEMPLOS = [
	{ id: 'barbearia', label: 'Barbearia do Zé', subtitulo: 'Negócio local · Recife-PE', exemplo: EXEMPLO_BARBEARIA },
	{ id: 'nutricao', label: 'Consultório de Nutrição', subtitulo: 'Modo Saúde · São Paulo-SP', exemplo: EXEMPLO_NUTRICAO },
];

// ---------------------------------------------------------------------------
// VALIDAÇÃO DE FORMATO (Parte 1, seções 2 e 3)
// ---------------------------------------------------------------------------

const SECOES_OBRIGATORIAS = [
	'objetivo',
	'briefing',
	'stories',
	'reels',
	'post_feed',
	'acao_comercial',
	'acao_extra',
	'meta_do_dia',
	'checklist_ontem',
	'roteiro_video',
	'tarefas',
];

const SUBCAMPOS_STORIES = ['horario', 'o_que_gravar', 'texto', 'cta'];
const SUBCAMPOS_REELS = ['horario', 'tema', 'gancho', 'legenda', 'hashtags'];
const SUBCAMPOS_POST = ['ideia_imagem', 'texto', 'cta'];
const SUBCAMPOS_META = ['leads', 'conversas', 'agendamentos', 'vendas'];
const SUBCAMPOS_ROTEIRO = ['titulo', 'duracao_segundos', 'formato', 'cenas', 'audio', 'texto_tela', 'dica_gravacao'];

const CENAS_ESPERADAS = ['GANCHO', 'DESENVOLVIMENTO', 'ENTREGA DE VALOR', 'CTA FINAL'];

const TIPOS_TAREFA_VALIDOS = ['stories', 'reels', 'post', 'acao_comercial', 'relacionamento', 'educacao'];

// Termos proibidos no Modo Saúde (linguagem promocional agressiva / promessas).
const TERMOS_PROIBIDOS_SAUDE = [
	'promoção',
	'oferta imperdível',
	'vaga limitada',
	'desconto',
	'garantido',
	'cura',
	'resultado garantido',
	'antes e depois',
	'emagreça rápido',
	'emagrecimento rápido',
	'milagre',
	'sensacional',
	'urgência',
	'última chance',
];

/**
 * Valida um plano (objeto JSON) contra o formato da Parte 1.
 *
 * @param {object} plano - saída da IA (objeto JSON do plano)
 * @param {{ saude?: boolean }} opcoes - se saude=true, aplica regras éticas
 * @returns {{ score: number, conformidade: number, ok: boolean, checagens: Array<{label:string, ok:boolean, detalhe?:string}>, problemas: string[] }}
 */
export function validarPlano(plano, opcoes = {}) {
	const checagens = [];
	const problemas = [];

	if (!plano || typeof plano !== 'object') {
		return {
			score: 0,
			conformidade: 0,
			ok: false,
			checagens: [{ label: 'Plano é um objeto JSON válido', ok: false, detalhe: 'A IA não retornou um objeto JSON.' }],
			problemas: ['A IA não retornou um objeto JSON válido.'],
		};
	}

	// 1. Seções obrigatórias
	const ausentes = SECOES_OBRIGATORIAS.filter((s) => plano[s] === undefined || plano[s] === null || plano[s] === '');
	checagens.push({
		label: 'Seções obrigatórias presentes',
		ok: ausentes.length === 0,
		detalhe: ausentes.length ? `Faltando: ${ausentes.join(', ')}` : 'Todas as 11 seções presentes',
	});
	if (ausentes.length) problemas.push(`Seções faltando: ${ausentes.join(', ')}`);

	// 2. Subcampos de stories
	if (plano.stories) {
		const faltam = SUBCAMPOS_STORIES.filter((c) => !plano.stories[c]);
		checagens.push({
			label: 'Stories com horário, o que gravar, texto e CTA',
			ok: faltam.length === 0,
			detalhe: faltam.length ? `Faltando: ${faltam.join(', ')}` : 'Completo',
		});
		if (faltam.length) problemas.push(`Stories incompleto: ${faltam.join(', ')}`);
	}

	// 3. Subcampos de reels
	if (plano.reels) {
		const faltam = SUBCAMPOS_REELS.filter((c) => !plano.reels[c]);
		checagens.push({
			label: 'Reels com horário, tema, gancho, legenda e hashtags',
			ok: faltam.length === 0,
			detalhe: faltam.length ? `Faltando: ${faltam.join(', ')}` : 'Completo',
		});
		if (faltam.length) problemas.push(`Reels incompleto: ${faltam.join(', ')}`);
	}

	// 4. Subcampos de post_feed
	if (plano.post_feed) {
		const faltam = SUBCAMPOS_POST.filter((c) => !plano.post_feed[c]);
		checagens.push({
			label: 'Post de feed com imagem, texto e CTA',
			ok: faltam.length === 0,
			detalhe: faltam.length ? `Faltando: ${faltam.join(', ')}` : 'Completo',
		});
		if (faltam.length) problemas.push(`Post de feed incompleto: ${faltam.join(', ')}`);
	}

	// 5. Meta do dia
	if (plano.meta_do_dia) {
		const faltam = SUBCAMPOS_META.filter((c) => !plano.meta_do_dia[c]);
		checagens.push({
			label: 'Meta do dia com leads, conversas, agendamentos e vendas',
			ok: faltam.length === 0,
			detalhe: faltam.length ? `Faltando: ${faltam.join(', ')}` : 'Completo',
		});
		if (faltam.length) problemas.push(`Meta do dia incompleta: ${faltam.join(', ')}`);
	}

	// 6. Checklist de ontem
	const checklistOk = Array.isArray(plano.checklist_ontem) && plano.checklist_ontem.length >= 2;
	checagens.push({
		label: 'Checklist de ontem (2+ itens)',
		ok: checklistOk,
		detalhe: checklistOk ? `${plano.checklist_ontem.length} itens` : 'Ausente ou com menos de 2 itens',
	});
	if (!checklistOk) problemas.push('Checklist de ontem ausente ou insuficiente');

	// 7. Roteiro de vídeo — subcampos
	if (plano.roteiro_video) {
		const faltam = SUBCAMPOS_ROTEIRO.filter((c) => !plano.roteiro_video[c]);
		checagens.push({
			label: 'Roteiro com título, duração, formato, cenas, áudio, texto e dica',
			ok: faltam.length === 0,
			detalhe: faltam.length ? `Faltando: ${faltam.join(', ')}` : 'Completo',
		});
		if (faltam.length) problemas.push(`Roteiro incompleto: ${faltam.join(', ')}`);

		// 8. Cenas cena a cena (Gancho → Desenvolvimento → Entrega de Valor → CTA Final)
		const cenas = Array.isArray(plano.roteiro_video.cenas) ? plano.roteiro_video.cenas : [];
		const nomesCenas = cenas.map((c) => String(c.nome || '').toUpperCase());
		const cenasFaltando = CENAS_ESPERADAS.filter((nome) => !nomesCenas.includes(nome));
		const cenasOk = cenas.length >= 4 && cenasFaltando.length === 0;
		checagens.push({
			label: 'Roteiro cena a cena (Gancho → Desenvolvimento → Entrega de Valor → CTA Final)',
			ok: cenasOk,
			detalhe: cenasOk ? `${cenas.length} cenas` : `Cenas faltando: ${cenasFaltando.join(', ') || 'menos de 4 cenas'}`,
		});
		if (!cenasOk) problemas.push(`Cenas do roteiro faltando: ${cenasFaltando.join(', ') || 'menos de 4 cenas'}`);

		// 9. Cada cena com fala e ação
		const cenasCompletas = cenas.every((c) => c.fala && c.acao && c.tempo);
		checagens.push({
			label: 'Cada cena com tempo, fala e ação',
			ok: cenasCompletas,
			detalhe: cenasCompletas ? 'Todas as cenas completas' : 'Alguma cena sem tempo, fala ou ação',
		});
		if (!cenasCompletas) problemas.push('Alguma cena do roteiro está sem tempo, fala ou ação');
	}

	// 10. Tarefas
	const tarefas = Array.isArray(plano.tarefas) ? plano.tarefas : [];
	const tiposInvalidos = tarefas.filter((t) => !TIPOS_TAREFA_VALIDOS.includes(t.tipo));
	const tarefasOk = tarefas.length >= 5 && tiposInvalidos.length === 0;
	checagens.push({
		label: 'Tarefas (5+) com tipo válido',
		ok: tarefasOk,
		detalhe: tarefasOk ? `${tarefas.length} tarefas` : `${tarefas.length} tarefas, ${tiposInvalidos.length} com tipo inválido`,
	});
	if (!tarefasOk) problemas.push('Tarefas insuficientes ou com tipo inválido');

	// 11. Modo Saúde — regras éticas
	if (opcoes.saude) {
		const textoCompleto = JSON.stringify(plano).toLowerCase();
		const termosEncontrados = TERMOS_PROIBIDOS_SAUDE.filter((termo) => textoCompleto.includes(termo));
		const saudeOk = termosEncontrados.length === 0;
		checagens.push({
			label: 'Modo Saúde: sem linguagem promocional agressiva / promessas de cura',
			ok: saudeOk,
			detalhe: saudeOk ? 'Nenhum termo proibido encontrado' : `Termos suspeitos: ${termosEncontrados.join(', ')}`,
		});
		if (!saudeOk) problemas.push(`Modo Saúde violado — termos suspeitos: ${termosEncontrados.join(', ')}`);

		// Convite sutil (não venda direta)
		const ctaSaude = String(plano.stories?.cta || plano.post_feed?.cta || '').toLowerCase();
		const conviteOk = !/(compre|comprar|preço|valor|desconto|garantido)/.test(ctaSaude);
		checagens.push({
			label: 'Modo Saúde: convite sutil ao agendamento (não venda direta)',
			ok: conviteOk,
			detalhe: conviteOk ? 'CTA acolhedor' : 'CTA com linguagem de venda',
		});
		if (!conviteOk) problemas.push('CTA com linguagem de venda direta (Modo Saúde)');
	}

	const okCount = checagens.filter((c) => c.ok).length;
	const total = checagens.length;
	const conformidade = Math.round((okCount / total) * 100);

	return {
		score: okCount,
		conformidade,
		ok: conformidade >= 90,
		checagens,
		problemas,
	};
}

/**
 * Serializa um plano para texto copiável (formato legível).
 */
export function planoParaTexto(exemplo) {
	const { cadastro, plano } = exemplo;
	const linhas = [];

	linhas.push(`# PLANO DO DIA — ${cadastro.nome}`);
	linhas.push(`Segmento: ${cadastro.segmento === 'saude' ? 'Saúde' : 'Negócio local'} · ${cadastro.cidade}-${cadastro.estado}`);
	linhas.push(`Assistente: ${cadastro.assistente_nome}`);
	linhas.push(`Objetivo: ${cadastro.objetivos}`);
	if (cadastro.promocoes_atuais) linhas.push(`Contexto: ${cadastro.promocoes_atuais}`);
	linhas.push('');
	linhas.push(`## OBJETIVO DO DIA`);
	linhas.push(plano.objetivo);
	linhas.push('');
	linhas.push(`## BRIEFING`);
	linhas.push(plano.briefing);
	linhas.push('');
	linhas.push(`## STORIES`);
	linhas.push(`Horário: ${plano.stories.horario}`);
	linhas.push(`O que gravar: ${plano.stories.o_que_gravar}`);
	linhas.push(`Texto na tela: ${plano.stories.texto}`);
	linhas.push(`CTA: ${plano.stories.cta}`);
	linhas.push('');
	linhas.push(`## REELS`);
	linhas.push(`Horário: ${plano.reels.horario}`);
	linhas.push(`Tema: ${plano.reels.tema}`);
	linhas.push(`Gancho: ${plano.reels.gancho}`);
	linhas.push(`Legenda: ${plano.reels.legenda}`);
	linhas.push(`Hashtags: ${Array.isArray(plano.reels.hashtags) ? plano.reels.hashtags.join(' ') : plano.reels.hashtags}`);
	linhas.push('');
	linhas.push(`## POST DE FEED`);
	linhas.push(`Imagem: ${plano.post_feed.ideia_imagem}`);
	linhas.push(`Texto: ${plano.post_feed.texto}`);
	linhas.push(`CTA: ${plano.post_feed.cta}`);
	linhas.push('');
	linhas.push(`## AÇÃO COMERCIAL`);
	linhas.push(plano.acao_comercial);
	linhas.push('');
	linhas.push(`## AÇÃO EXTRA`);
	linhas.push(plano.acao_extra);
	linhas.push('');
	linhas.push(`## META DO DIA`);
	linhas.push(`Leads: ${plano.meta_do_dia.leads}`);
	linhas.push(`Conversas: ${plano.meta_do_dia.conversas}`);
	linhas.push(`Agendamentos: ${plano.meta_do_dia.agendamentos}`);
	linhas.push(`Vendas: ${plano.meta_do_dia.vendas}`);
	linhas.push('');
	linhas.push(`## CHECKLIST DE ONTEM`);
	(plano.checklist_ontem || []).forEach((item) => linhas.push(`- ${item}`));
	linhas.push('');
	linhas.push(`## ROTEIRO DE VÍDEO — ${plano.roteiro_video.titulo}`);
	linhas.push(`Duração: ${plano.roteiro_video.duracao_segundos}s · Formato: ${plano.roteiro_video.formato}`);
	linhas.push('');
	(plano.roteiro_video.cenas || []).forEach((cena) => {
		linhas.push(`CENA — ${cena.nome} (${cena.tempo})`);
		linhas.push(`Fala: ${cena.fala}`);
		linhas.push(`Ação: ${cena.acao}`);
		linhas.push('');
	});
	linhas.push(`Áudio: ${plano.roteiro_video.audio}`);
	linhas.push(`Texto na tela: ${plano.roteiro_video.texto_tela}`);
	linhas.push(`Dica de gravação: ${plano.roteiro_video.dica_gravacao}`);
	linhas.push('');
	linhas.push(`## TAREFAS`);
	(plano.tarefas || []).forEach((t, i) => {
		linhas.push(`${i + 1}. [${t.tipo}] ${t.titulo} — ${t.descricao}`);
	});

	return linhas.join('\n');
}
