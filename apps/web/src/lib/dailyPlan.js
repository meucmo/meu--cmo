import { format, addDays, startOfWeek, addMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { integratedAiClient } from '@/lib/integratedAiClient';
import pb from '@/lib/pocketbaseClient';

export const PLAN_TRIGGER = '[GERAR_PLANO_DO_DIA]';
export const PLAN_AMANHA_TRIGGER = '[GERAR_PLANO_AMANHA]';
export const PLAN_SEMANA_TRIGGER = '[GERAR_PLANO_SEMANA]';
export const PLAN_MES_TRIGGER = '[GERAR_CALENDARIO_MENSAL]';

const TIPOS_VALIDOS = ['stories', 'reels', 'post', 'acao_comercial', 'relacionamento', 'educacao'];

export function todayKey(date = new Date()) {
	return format(date, 'yyyy-MM-dd');
}

export function buildPlanRequestMessage(date = new Date()) {
	const diaSemana = format(date, 'EEEE', { locale: ptBR });
	const dataFormatada = format(date, 'dd/MM/yyyy');
	return `${PLAN_TRIGGER}\nHoje é ${diaSemana}, ${dataFormatada}. Gere o plano de marketing do dia para a minha empresa seguindo exatamente o protocolo JSON combinado.`;
}

export function buildAmanhaRequestMessage() {
	const amanha = addDays(new Date(), 1);
	const diaSemana = format(amanha, 'EEEE', { locale: ptBR });
	const dataFormatada = format(amanha, 'dd/MM/yyyy');
	return `${PLAN_AMANHA_TRIGGER}\nAmanhã será ${diaSemana}, ${dataFormatada}. Gere o plano de marketing de amanhã para a minha empresa seguindo exatamente o protocolo JSON combinado.`;
}

export function buildSemanaRequestMessage() {
	const inicio = startOfWeek(new Date(), { weekStartsOn: 1 });
	const fim = addDays(inicio, 6);
	return `${PLAN_SEMANA_TRIGGER}\nGere o plano de marketing da semana de ${format(inicio, 'dd/MM/yyyy')} a ${format(fim, 'dd/MM/yyyy')} para a minha empresa, seguindo exatamente o protocolo JSON combinado.`;
}

export function buildMesRequestMessage() {
	const inicio = startOfMonth(addMonths(new Date(), 1));
	return `${PLAN_MES_TRIGGER}\nGere o calendário de conteúdo mensal de ${format(inicio, 'MMMM yyyy', { locale: ptBR })} para a minha empresa, seguindo exatamente o protocolo JSON combinado.`;
}

export function isPlanRequestMessage(content) {
	if (typeof content !== 'string') return false;
	const trimmed = content.trimStart();
	return (
		trimmed.startsWith(PLAN_TRIGGER) ||
		trimmed.startsWith(PLAN_AMANHA_TRIGGER) ||
		trimmed.startsWith(PLAN_SEMANA_TRIGGER) ||
		trimmed.startsWith(PLAN_MES_TRIGGER)
	);
}

function extractJson(text) {
	if (typeof text !== 'string') {
		throw new Error('A IA não retornou um plano válido. Tente gerar novamente.');
	}
	const start = text.indexOf('{');
	const end = text.lastIndexOf('}');
	if (start === -1 || end === -1 || end <= start) {
		throw new Error('A IA não retornou um plano válido. Tente gerar novamente.');
	}
	return JSON.parse(text.slice(start, end + 1));
}

export function parsePlanJson(text) {
	const parsed = extractJson(text);
	if (Array.isArray(parsed.dias)) {
		// plano de semana ou mês
		if (!parsed.dias.length) {
			throw new Error('O plano retornado não trouxe dias. Tente gerar novamente.');
		}
		return { tipoPeriodo: parsed.dias.length >= 20 ? 'mes' : 'semana', json: parsed };
	}
	if (!Array.isArray(parsed.tarefas) || parsed.tarefas.length === 0) {
		throw new Error('O plano retornado não trouxe tarefas. Tente gerar novamente.');
	}
	return { tipoPeriodo: 'diario', json: parsed };
}

export function isPlanResponseMessage(content) {
	if (typeof content !== 'string') return false;
	const trimmed = content.trim();
	if (!trimmed.startsWith('{')) return false;
	try {
		parsePlanJson(trimmed);
		return true;
	} catch {
		return false;
	}
}

async function streamAiText(messageText) {
	const response = await integratedAiClient.stream('/integrated-ai/stream', {
		body: { message: [{ text: messageText, type: 'text' }] },
		images: [],
	});

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	let fullText = '';

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });
		const events = buffer.split('\n\n');
		buffer = events.pop() || '';
		for (const event of events) {
			if (!event.trim()) continue;
			let eventData = '';
			for (const line of event.split('\n')) {
				if (line.startsWith('data: ')) eventData += line.slice(6);
			}
			if (!eventData) continue;
			const parsed = JSON.parse(eventData);
			if (parsed.type === 'error') {
				throw new Error(parsed.data?.content || 'Erro ao gerar o plano.');
			}
			if (parsed.type === 'content' && parsed.data?.content) {
				fullText += parsed.data.content;
			}
		}
	}

	return fullText;
}

/**
 * Persiste um plano de semana ou mês (calendário). Cria um registro em
 * planos_diarios por dia, cada um com suas tarefas.
 */
async function savePeriodPlan(tipo, planJson, empresa) {
	const ownerId = pb.authStore.record.id;
	const dias = planJson.dias || [];
	const criados = [];

	for (let i = 0; i < dias.length; i++) {
		const dia = dias[i];
		const data = String(dia.data || todayKey(addDays(new Date(), i))).slice(0, 10);

		// Remove plano existente para o mesmo dia/tipo (evita duplicar).
		const existing = await pb.collection('planos_diarios').getList(1, 1, {
			filter: pb.filter('empresa = {:e} && data = {:d} && tipo = {:t}', { e: empresa.id, d: data, t: tipo }),
		});
		for (const item of existing.items) {
			await pb.collection('planos_diarios').delete(item.id, { requestKey: `del-${item.id}` });
		}

		const plano = await pb.collection('planos_diarios').create({
			empresa: empresa.id,
			owner: ownerId,
			data,
			tipo,
			titulo: i === 0 ? (planJson.titulo || planJson.foco || '') : '',
			foco: String(dia.foco || planJson.foco || ''),
			resumo: i === 0 ? String(planJson.resumo || '') : '',
			plano_completo: { dia, foco_periodo: planJson.foco, resumo_periodo: planJson.resumo },
			roteiro_video: null,
		}, { requestKey: `plano-${tipo}-${i}` });

		const tarefasDia = Array.isArray(dia.tarefas) ? dia.tarefas.slice(0, 6) : [];
		const tarefas = await Promise.all(
			tarefasDia.map((tarefa, index) =>
				pb.collection('tarefas').create({
					plano: plano.id,
					empresa: empresa.id,
					owner: ownerId,
					tipo: TIPOS_VALIDOS.includes(tarefa.tipo) ? tarefa.tipo : 'post',
					titulo: String(tarefa.titulo || `Tarefa ${index + 1}`).slice(0, 200),
					descricao: String(tarefa.descricao || '').slice(0, 1000),
					concluida: false,
					ordem: index,
				}, { requestKey: `tarefa-${tipo}-${i}-${index}` }),
			),
		);
		criados.push({ plano, tarefas });
	}

	return { plano: criados[0]?.plano || null, tarefas: criados.flatMap((c) => c.tarefas), dias: criados };
}

/**
 * Streams a new daily plan from the AI and persists it (plan + tasks) in PocketBase.
 * Replaces any plan already generated for the same day/company.
 */
export async function generateAndSaveDailyPlan(empresa, { amanha = false } = {}) {
	const text = await streamAiText(amanha ? buildAmanhaRequestMessage() : buildPlanRequestMessage());
	const { tipoPeriodo, json: planJson } = parsePlanJson(text);

	if (tipoPeriodo !== 'diario') {
		// A IA retornou um calendário quando pediram um plano diário — salva como tal.
		return savePeriodPlan(tipoPeriodo, planJson, empresa);
	}

	const ownerId = pb.authStore.record.id;
	const data = amanha ? todayKey(addDays(new Date(), 1)) : todayKey();

	const existing = await pb.collection('planos_diarios').getList(1, 1, {
		filter: pb.filter('empresa = {:e} && data = {:d} && tipo = {:t}', { e: empresa.id, d: data, t: 'diario' }),
	});
	for (const item of existing.items) {
		await pb.collection('planos_diarios').delete(item.id, { requestKey: `del-plano-${item.id}` });
	}

	const plano = await pb.collection('planos_diarios').create({
		empresa: empresa.id,
		owner: ownerId,
		data,
		tipo: 'diario',
		foco: String(planJson.objetivo || planJson.foco || ''),
		resumo: String(planJson.briefing || planJson.resumo || ''),
		roteiro_video: planJson.roteiro_video || null,
		plano_completo: planJson,
	});

	const tarefas = await Promise.all(
		planJson.tarefas.slice(0, 8).map((tarefa, index) =>
			pb.collection('tarefas').create({
				plano: plano.id,
				empresa: empresa.id,
				owner: ownerId,
				tipo: TIPOS_VALIDOS.includes(tarefa.tipo) ? tarefa.tipo : 'post',
				titulo: String(tarefa.titulo || `Tarefa ${index + 1}`).slice(0, 200),
				descricao: String(tarefa.descricao || '').slice(0, 1000),
				concluida: false,
				ordem: index,
			}, { requestKey: `create-tarefa-${index}` }),
		),
	);

	return { plano, tarefas };
}

export async function generateAndSaveWeekPlan(empresa) {
	const text = await streamAiText(buildSemanaRequestMessage());
	const { json: planJson } = parsePlanJson(text);
	return savePeriodPlan('semana', planJson, empresa);
}

export async function generateAndSaveMonthPlan(empresa) {
	const text = await streamAiText(buildMesRequestMessage());
	const { json: planJson } = parsePlanJson(text);
	return savePeriodPlan('mes', planJson, empresa);
}

/**
 * Best-effort extraction of structured company fields from the raw onboarding answers.
 */
export async function extractOnboardingFields(respostas) {
	const entradas = Object.entries(respostas)
		.filter(([, v]) => v && String(v).trim())
		.map(([k, v]) => `${k}: ${v}`);

	if (entradas.length === 0) return null;

	const prompt = [
		'Você é um assistente que organiza dados de cadastro de empresas.',
		'A partir do relato abaixo, extraia as informações da empresa.',
		'Responda APENAS com um objeto JSON válido, sem markdown, sem crases e sem nenhum texto antes ou depois.',
		'Use exatamente estas chaves (deixe vazio "" se a informação não aparecer):',
		'{"nome":"","cidade":"","estado":"","instagram":"","whatsapp":"","especialidade":"","perfil_pacientes":"","objetivos_crescimento":"","produtos_servicos":"","publico_alvo":"","objetivos":"","promocoes_atuais":""}',
		'Para instagram inclua o @; para whatsapp coloque o número informado.',
		'',
		'RELATO:',
		entradas.join('\n'),
	].join('\n');

	try {
		const text = await streamAiText(prompt);
		return extractJson(text);
	} catch {
		return null;
	}
}
