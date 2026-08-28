# Meu CMO

Plataforma SaaS de assinatura onde uma IA atua como gerente de marketing (CMO) diário para pequenos negócios locais e profissionais/clínicas de saúde.

## Stack

- **Frontend:** React + Vite + Tailwind CSS (PWA)
- **Backend:** Express.js (API)
- **Database/Auth:** PocketBase + SQLite
- **IA:** Integrated AI (plataforma Hostinger)
- **Pagamentos:** Subscriptions infrastructure (3 planos)

## Planos

| Plano | Preço | Público |
|------|-------|---------|
| Empresa | R$59/mês | Pequenos negócios locais |
| Pro Empresa | R$97/mês | Crescimento acelerado |
| Saúde | R$397/mês | Profissionais e clínicas de saúde |

## Funcionalidades

- Onboarding conversacional (segmento → dados da empresa → nome do assistente)
- Plano de marketing diário com roteiros de vídeo (Stories, Reels, Feed)
- Modo Saúde com regras éticas (educação > confiança > posicionamento)
- Chat com a IA (CMO) com limites por plano
- Banco de ideias, histórico com exportação CSV
- Painel admin com métricas (MRR, churn, evolução)
- PWA instalável (Android/iOS)

## Deploy

Veja `RAILWAY_DEPLOY.md` para o passo a passo completo de deploy no Railway.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Serviços:
- Web: http://localhost:3000
- API: http://localhost:3001
- PocketBase: http://localhost:8090
