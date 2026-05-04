import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
const realtimeModel = Deno.env.get("OPENAI_REALTIME_MODEL") ?? "gpt-realtime";
const realtimeVoice = Deno.env.get("OPENAI_REALTIME_VOICE") ?? "marin";
const realtimeSilenceDurationMs = Number(Deno.env.get("OPENAI_REALTIME_SILENCE_DURATION_MS") ?? "2000");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const voiceInstructions = [
  "Voce e o atendente virtual por voz de Lucas Tomaz.",
  "Fale sempre em portugues do Brasil, com tom consultivo, profissional e objetivo.",
  "Seu papel e qualificar leads para projetos de software sob medida e tambem apresentar Lucas, seus servicos, diferenciais e cases quando perguntarem.",
  "Conduza a conversa naturalmente para entender: necessidade principal, processo atual, urgencia, prazo desejado, orcamento aproximado ou faixa de investimento, responsaveis pela decisao e melhor canal de contato.",
  "Nao pressione por preco exato. Se perguntarem sobre orcamento, explique que o valor depende do escopo tecnico e proponha encaminhar para WhatsApp.",
  "Quando houver intencao comercial clara, convide a pessoa a chamar Lucas no WhatsApp: https://wa.me/5542999839219.",
  "Evite respostas longas. Prefira perguntas curtas, uma por vez, como em uma conversa real.",
].join("\n");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!openaiApiKey) {
    return jsonResponse({ error: "OPENAI_API_KEY is not configured" }, 500);
  }

  const limitResponse = await enforceRateLimit(req, "voice-session", 5, 20);
  if (limitResponse) return limitResponse;

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: realtimeModel,
          instructions: voiceInstructions,
          audio: {
            input: {
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: realtimeSilenceDurationMs,
                create_response: true,
              },
              transcription: {
                model: "whisper-1",
              },
            },
            output: {
              voice: realtimeVoice,
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return jsonResponse({ error: "Failed to create realtime client secret" }, response.status);
    }

    return jsonResponse(data);
  } catch (error) {
    console.error(error);
    return jsonResponse({ error: "Failed to create realtime client secret" }, 500);
  }
});

async function enforceRateLimit(req: Request, scope: string, hourlyLimit: number, dailyLimit: number) {
  const clientHash = await getClientHash(req);
  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();

  const { count: hourlyCount, error: hourlyError } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("scope", scope)
    .eq("client_hash", clientHash)
    .gte("created_at", hourAgo);

  if (hourlyError) {
    console.error(hourlyError);
    return jsonResponse({ error: "Rate limit unavailable" }, 503);
  }

  if ((hourlyCount ?? 0) >= hourlyLimit) {
    return jsonResponse({
      error: "Limite de uso por hora atingido. Tente novamente mais tarde.",
      spoken_message: "Você atingiu o limite de atendimento por voz nesta hora. Tente novamente mais tarde ou continue pelo atendimento por texto.",
    }, 429);
  }

  const { count: dailyCount, error: dailyError } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("scope", scope)
    .eq("client_hash", clientHash)
    .gte("created_at", dayAgo);

  if (dailyError) {
    console.error(dailyError);
    return jsonResponse({ error: "Rate limit unavailable" }, 503);
  }

  if ((dailyCount ?? 0) >= dailyLimit) {
    return jsonResponse({
      error: "Limite diário de uso atingido. Tente novamente amanhã.",
      spoken_message: "Você atingiu o limite diário de atendimento por voz. Tente novamente amanhã ou continue pelo atendimento por texto.",
    }, 429);
  }

  const { error: insertError } = await supabase
    .from("rate_limit_events")
    .insert({ scope, client_hash: clientHash });

  if (insertError) {
    console.error(insertError);
    return jsonResponse({ error: "Rate limit unavailable" }, 503);
  }

  return null;
}

async function getClientHash(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";
  const data = new TextEncoder().encode(`${ip}|${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
