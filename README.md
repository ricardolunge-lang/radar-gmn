# Radar GMN · Braza Labz

Prospecção por Google Meu Negócio: busca empresas por nicho e cidade, lê o perfil no Google e dá um score de oportunidade (quanto pior o perfil, maior o score).

## Rodar
    npm install
    cp .env.example .env.local   # coloque a GOOGLE_PLACES_API_KEY
    npm run dev

Com a chave do Google, defina também APP_SENHA: o navegador pede uma senha pra entrar (o usuário pode ser qualquer um).
Sem a chave, o app roda em modo demonstração com dados fictícios.

## Onde mexer
- lib/score.ts  → regras do score, textos dos problemas e mensagem de WhatsApp
- lib/google.ts → busca na Places API (New), até 60 empresas por busca
- app/page.tsx  → tela

## Produção
https://radar-gmn.vercel.app (variáveis GOOGLE_PLACES_API_KEY e APP_SENHA configuradas no Vercel)
