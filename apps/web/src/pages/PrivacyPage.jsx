import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

const SECOES = [
	{
		titulo: '1. Quem somos',
		texto:
			'O Meu CMO é uma plataforma SaaS que usa inteligência artificial para gerar planos de marketing diários. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).',
	},
	{
		titulo: '2. Dados que coletamos',
		texto:
			'Dados de cadastro: nome, e-mail e senha. Dados de empresa: nome do negócio, segmento, cidade, especialidade, público-alvo, produtos/serviços, objetivos e canais de contato que você informar. Dados de uso: mensagens trocadas com a IA, planos gerados e tarefas marcadas como concluídas. Dados de pagamento: processados pelo provedor de pagamento; não armazenamos números de cartão.',
	},
	{
		titulo: '3. Como usamos seus dados',
		texto:
			'Utilizamos seus dados para: (i) criar e manter sua conta; (ii) gerar planos de marketing personalizados com o contexto da sua empresa; (iii) manter o histórico de planos e conversas; (iv) processar pagamentos e emitir cobranças; (v) enviar comunicações sobre o serviço, como confirmações de assinatura e atualizações relevantes; (vi) melhorar a qualidade das respostas da IA e do produto.',
	},
	{
		titulo: '4. Base legal',
		texto:
			'Tratamos seus dados com base no consentimento (cadastro e uso), na execução de contrato (assinatura e geração de planos) e no legítimo interesse (segurança, prevenção a fraudes e melhoria do serviço). Você pode retirar o consentimento a qualquer momento, sem prejuízo do uso já realizado.',
	},
	{
		titulo: '5. Compartilhamento',
		texto:
			'Compartilhamos dados apenas com provedores essenciais ao funcionamento do Serviço: provedor de inteligência artificial (para gerar os planos), provedor de pagamento (para processar cobranças) e provedor de infraestrutura/hospedagem. Esses fornecedores estão obrigados a proteger seus dados e a utilizá-los apenas para a finalidade contratada. Não vendemos seus dados.',
	},
	{
		titulo: '6. Inteligência artificial',
		texto:
			'As informações da sua empresa são enviadas ao provedor de IA exclusivamente para gerar seus planos de marketing. Recomendamos não incluir dados sensíveis desnecessários (como prontuários médicos ou dados financeiros de clientes). No segmento de saúde, evite cadastrar informações que identifiquem pacientes individualmente.',
	},
	{
		titulo: '7. Segurança',
		texto:
			'Adotamos medidas técnicas e organizacionais para proteger seus dados: criptografia em trânsito (HTTPS), armazenamento em infraestrutura segura, controle de acesso baseado em conta e regras de acesso que isolam os dados de cada usuário. Nenhum sistema é totalmente seguro, mas trabalhamos continuamente para reduzir riscos.',
	},
	{
		titulo: '8. Retenção',
		texto:
			'Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento, os dados são retidos pelo período necessário para cumprir obrigações legais, fiscais ou de segurança, e depois excluídos. Você pode solicitar a exclusão antecipada a qualquer momento pela página de configurações.',
	},
	{
		titulo: '9. Seus direitos (LGPD)',
		texto:
			'Você pode solicitar: confirmação de tratamento, acesso aos dados, correção, anonimização, portabilidade e eliminação. Também pode revogar consentimento e opor-se ao tratamento. Para exercer qualquer direito, entre em contato pelo nosso canal de suporte. Respondemos em até 15 dias úteis.',
	},
	{
		titulo: '10. Cookies',
		texto:
			'Utilizamos cookies e armazenamento local essenciais para manter sua sessão autenticada, lembrar suas preferências (como o tema claro/escuro) e o funcionamento básico do Serviço. Não utilizamos cookies de rastreamento para publicidade de terceiros.',
	},
	{
		titulo: '11. Crianças e adolescentes',
		texto:
			'O Serviço é destinado a profissionais e empresas, não a menores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifique tal situação, entre em contato para exclusão imediata.',
	},
	{
		titulo: '12. Alterações desta política',
		texto:
			'Esta Política pode ser atualizada periodicamente. Alterações relevantes serão comunicadas pelo e-mail cadastrado ou por aviso no Serviço. Recomendamos revisar esta página periodicamente.',
	},
	{
		titulo: '13. Contato',
		texto:
			'Para dúvidas, solicitações de direitos ou questões sobre privacidade, entre em contato pelo canal de suporte disponível na sua conta. Atuamos como controlador dos dados tratados pelo Serviço.',
	},
];

export default function PrivacyPage() {
	return (
		<div className="min-h-[100dvh] bg-background">
			<Helmet>
				<title>Política de Privacidade — Meu CMO</title>
				<meta name="description" content="Política de Privacidade do Meu CMO, em conformidade com a LGPD." />
			</Helmet>
			<header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
					<Link to="/" className="flex items-center gap-2">
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<Bot className="h-4.5 w-4.5 text-primary-foreground" />
						</span>
						<span className="font-display text-lg font-bold tracking-tight">Meu CMO</span>
					</Link>
					<div className="flex items-center gap-2">
						<ThemeToggle />
						<Button asChild size="sm" variant="outline">
							<Link to="/cadastro">Criar conta</Link>
						</Button>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
				<p className="text-xs font-medium uppercase tracking-wide text-primary">Legal</p>
				<h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Política de Privacidade</h1>
				<p className="mt-3 text-sm text-muted-foreground">Última atualização: 1 de setembro de 2026</p>

				<div className="mt-10 space-y-8">
					{SECOES.map((secao) => (
						<section key={secao.titulo}>
							<h2 className="font-display text-lg font-semibold">{secao.titulo}</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">{secao.texto}</p>
						</section>
					))}
				</div>

				<div className="mt-12 flex flex-wrap items-center gap-4 border-t pt-8 text-sm text-muted-foreground">
					<Link to="/termos" className="font-medium text-primary hover:underline">Termos de Serviço</Link>
					<Link to="/plans" className="hover:text-foreground">Ver planos</Link>
					<Link to="/" className="hover:text-foreground">Voltar ao início</Link>
				</div>
			</main>
		</div>
	);
}
