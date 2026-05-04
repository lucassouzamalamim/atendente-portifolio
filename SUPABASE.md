# Arquitetura frontend + Supabase

A aplicacao pode rodar sem servidor Java usando:

- Frontend React hospedado em Vercel, Netlify, Supabase Hosting ou similar.
- Supabase Postgres para `message`, `project` e `system_info`.
- Supabase Edge Function `chat` para chamar OpenAI e gravar/ler dados.
- Supabase Edge Function `realtime-token` para gerar credenciais efemeras da OpenAI Realtime API.

O navegador nunca deve chamar OpenAI diretamente, porque isso exporia `OPENAI_API_KEY`.

## Banco

Execute as migrations em `supabase/migrations` pelo Supabase CLI ou copie o SQL para o `SQL Editor` do painel Supabase.

A migration `rate_limit_events` cria a tabela usada para limitar consumo por visitante sem armazenar IP bruto. O identificador salvo e um hash de IP + navegador.

## Edge Function

A function esta em:

```text
supabase/functions/chat/index.ts
```

Configure o secret:

```bash
supabase secrets set OPENAI_API_KEY=<openai-api-key>
```

Opcionalmente, configure o modelo. Se nao configurar, a function usa `gpt-5.4-mini`.

```bash
supabase secrets set OPENAI_MODEL=gpt-5.4-mini
```

Para atendimento por voz, configure opcionalmente:

```bash
supabase secrets set OPENAI_REALTIME_MODEL=gpt-realtime
supabase secrets set OPENAI_REALTIME_VOICE=marin
supabase secrets set OPENAI_REALTIME_SILENCE_DURATION_MS=2000
```

O Supabase injeta `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente da Edge Function.

Deploy:

```bash
supabase functions deploy chat
supabase functions deploy realtime-token
```

## Frontend

Configure:

```bash
VITE_SUPABASE_URL=https://ubvlrurllkxbgcfgvkdv.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
VITE_CHAT_ENDPOINT=https://ubvlrurllkxbgcfgvkdv.supabase.co/functions/v1/chat
VITE_REALTIME_TOKEN_ENDPOINT=https://ubvlrurllkxbgcfgvkdv.supabase.co/functions/v1/realtime-token
```

O frontend chamara:

```text
https://<project-ref>.supabase.co/functions/v1/chat
https://<project-ref>.supabase.co/functions/v1/realtime-token
```

Para testar uma function local, use:

```bash
VITE_CHAT_ENDPOINT=http://127.0.0.1:54321/functions/v1/chat
VITE_REALTIME_TOKEN_ENDPOINT=http://127.0.0.1:54321/functions/v1/realtime-token
```

O atendimento por voz usa microfone no navegador. Em producao, o site precisa rodar em HTTPS para o browser liberar `getUserMedia`.
A function `realtime-token` exige JWT anon do Supabase para evitar que o endpoint fique completamente aberto.

## Limites de uso

Para reduzir risco de consumo excessivo de tokens:

- Texto: ate 30 mensagens por hora e 120 por dia por visitante.
- Voz: ate 5 sessoes por hora e 20 por dia por visitante.

Os limites ficam nas Edge Functions `chat` e `realtime-token`.
Quando o limite de voz e atingido, o frontend fala uma mensagem local usando `speechSynthesis` do navegador, sem criar sessao OpenAI e sem gastar tokens.

## Backend

Nao ha servidor backend dedicado nesta arquitetura. A logica segura que precisa rodar fora do navegador fica na Supabase Edge Function.
