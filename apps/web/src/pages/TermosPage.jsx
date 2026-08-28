import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Bot } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';

const SECOES = [
	{
		titulo: '1. Aceitação dos termos',
		texto:
			'Ao acessar ou utilizar o Meu CMO (o "Serviço"), você concorda com estes Termos de Serviço. Se não concordar com qualquer parte, não utilize o Serviço. O Meu CMO é operado por Meu CMO, empresa prestadora de serviços de software (SaaS) com foco em marketing assistido por inteligência artificial.',
	},
	{
		titulo: '2. Descrição do serviço',
		texto:
			'O Meu CMO é uma plataforma de assinatura que utiliza inteligência artificial para gerar planos de marketing diários, roteiros de vídeo, sugestões de conteúdo e ações comerciais para pequenos negócios e profissionais de saúde. O Serviço não garante resultados de vendas, alcance ou conversão, atuando como ferramenta de apoio à decisão de marketing.',
	},
	{
		titulo: '3. Cadastro e conta',
		texto:
			'Para utilizar o Serviço você deve criar uma conta com e-mail e senha, fornecendo informações verdadeiras e atualizadas. Você é responsável pela segurança da sua conta e por todas as atividades realizadas com ela. É proibido compartilhar credenciais ou criar contas para terceiros sem autorização.',
	},
	{
		titulo: '4. Assinatura e cobrança',
		texto:
			'O acesso aos recursos pagos ocorre por assinatura mensal recorrente, com renovação automática até o cancelamento. Os planos disponíveis são Empresa (R$ 59/mês), Pro Empresa (R$ 97/mês) e Saúde (R$ 397/mês). Os valores podem ser reajustados mediante comunicação prévia. O pagamento é processado por provedor de pagamento terceirizado, e o Meu CMO não armazena dados de cartão.',
	},
	{
		titulo: '5. Período de garantia',
		texto:
			'Oferecemos garantia de 7 dias contados a partir da ativação da assinatura. Caso não esteja satisfeito, você pode solicitar o reembolso integral nesse período, sem necessidade de justificativa, entrando em contato pelo nosso canal de suporte.',
	},
	{
		titulo: '6. Cancelamento',
		texto:
			'Você pode cancelar sua assinatura a qualquer momento, direto pelo painel de gerenciamento da sua conta. O cancelamento encerra a renovação automática, e você mantém o acesso até o fim do período já pago. Não há multa ou fidelidade.',
	},
	{
		titulo: '7. Uso aceitável',
		texto:
			'Você concorda em não utilizar o Serviço para fins ilegais, fraudulentos ou abusivos, nem para gerar conteúdo que viole direitos de terceiros, difame, infraja propriedade intelectual ou desrespeite a ética profissional — especialmente na área da saúde. É proibido tentar acessar áreas restritas, realizar engenharia reversa ou sobrecarregar a infraestrutura do Serviço.',
	},
	{
		titulo: '8. Conteúdo gerado por IA',
		texto:
			'Os planos, roteiros e sugestões são gerados por modelos de inteligência artificial e podem conter imprecisões. Você é responsável por revisar todo o conteúdo antes de publicá-lo. No segmento de saúde, o Serviço prioriza comunicação ética e educativa, mas a responsabilidade sobre a adequação profissional e legal do conteúdo publicado permanece inteiramente sua.',
	},
	{
		titulo: '9. Propriedade intelectual',
		texto:
			'O código, a marca, os textos e o design do Meu CMO são protegidos por direitos autorais e demais leis de propriedade intelectual. O conteúdo que você cadastra sobre sua empresa permanece seu. Ao utilizar o Serviço, você concede ao Meu CMO licença limitada para processar esses dados exclusivamente para gerar seus planos de marketing.',
	},
	{
		titulo: '10. Limitação de responsabilidade',
		texto:
			'O Serviço é fornecido "como está", sem garantias expressas ou implícitas. O Meu CMO não se responsabiliza por lucros cessantes, perda de dados, queda de vendas ou danos indiretos decorrentes do uso ou da impossibilidade de uso do Serviço. Nossa responsabilidade total não excede o valor pago nos últimos 12 meses de assinatura.',
	},
	{
		titulo: '11. Suspensão e encerramento',
		texto:
			'Podemos suspender ou encerrar contas que violem estes Termos, que apresentem atividade fraudulenta ou que permaneçam inadimplentes. Você pode encerrar sua conta a qualquer momento pela página de configurações, o que resultará na exclusão dos seus dados conforme nossa Política de Privacidade.',
	},
	{
		titulo: '12. Alterações dos termos',
		texto:
			'Estes Termos podem ser atualizados periodicamente. Alterações relevantes serão comunicadas pelo e-mail cadastrado. O uso continuado do Serviço após a atualização caracteriza aceitação dos novos Termos.',
	},
	{
		titulo: '13. Lei aplicável',
		texto:
			'Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será dirimida no foro da comarca do domicílio do usuário, renunciando-se a qualquer outro por mais privilegiado que seja.',
	},
];

export default function TermosPage() {
	return (
		<div className="min-h-[100dvh] bg-background">
			<Helmet>
				<title>Termos de Serviço — Meu CMO</title>
				<meta name="description" content="Termos de Serviço do Meu CMO, a IA gerente de marketing para pequenos negócios e profissionais de saúde." />
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
				<h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Termos de Serviço</h1>
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
					<Link to="/privacidade" className="font-medium text-primary hover:underline">Política de Privacidade</Link>
					<Link to="/plans" className="hover:text-foreground">Ver planos</Link>
					<Link to="/" className="hover:text-foreground">Voltar ao início</Link>
				</div>
			</main>
		</div>
	);
}
