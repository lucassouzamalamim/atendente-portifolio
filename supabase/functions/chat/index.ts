import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Sender = "USER" | "ASSISTANT";

type SystemInfo = {
  topic: string | null;
  content: string | null;
};

type Project = {
  title: string | null;
  description: string | null;
  technology: string | null;
  url: string | null;
  image_url: string | null;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const openaiApiKey = Deno.env.get("OPENAI_API_KEY") ?? "";
const openaiModel = Deno.env.get("OPENAI_MODEL") ?? "gpt-5.4-mini";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { message } = await req.json();
    if (typeof message !== "string" || !message.trim()) {
      return jsonResponse({ error: "Message is required" }, 400);
    }

    const limitResponse = await enforceRateLimit(req, "text-message", 30, 120);
    if (limitResponse) return limitResponse;

    await saveMessage(message, "USER");

    const lowerMessage = message.toLowerCase();
    const isProjectRequest = ["projetos", "cases", "trabalhos", "portfolio"].some((term) =>
      lowerMessage.includes(term)
    );

    const response = isProjectRequest
      ? await getProjectResponse()
      : await getAiResponse(message);

    await saveMessage(response.content, "ASSISTANT");

    return jsonResponse(response);
  } catch (error) {
    console.error(error);
    return jsonResponse({ content: "Desculpe, ocorreu um erro ao processar sua mensagem." }, 500);
  }
});

async function getProjectResponse() {
  const { data, error } = await supabase
    .from("project")
    .select("title, description, technology, url, image_url")
    .order("id", { ascending: true });

  if (error) throw error;

  return {
    content: "Aqui estao alguns dos projetos recentes que desenvolvi. Clique em 'Visualizar' para ver mais detalhes:",
    projects: (data ?? []).map((project: Project) => ({
      title: project.title,
      description: project.description,
      technology: project.technology,
      url: project.url,
      imageUrl: project.image_url,
    })),
  };
}

async function getAiResponse(userMessage: string) {
  if (!openaiApiKey) {
    return { content: "Configuracao da API invalida. Configure a chave OPENAI_API_KEY no Supabase." };
  }

  const context = await buildSystemContext();

  const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openaiModel,
      instructions: context,
      input: userMessage,
      max_output_tokens: 900,
    }),
  });

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    throw new Error(`OpenAI request failed: ${errorText}`);
  }

  const data = await openaiResponse.json();
  const content = extractOpenAiText(data);

  return {
    content: content || "Desculpe, nao consegui processar sua solicitacao no momento.",
  };
}

function extractOpenAiText(response: any) {
  if (typeof response?.output_text === "string") {
    return response.output_text;
  }

  return response?.output
    ?.flatMap((item: any) => item?.content ?? [])
    ?.filter((content: any) => content?.type === "output_text")
    ?.map((content: any) => content?.text)
    ?.filter(Boolean)
    ?.join("\n");
}

async function buildSystemContext() {
  const { data, error } = await supabase
    .from("system_info")
    .select("topic, content")
    .order("id", { ascending: true });

  if (error) throw error;

  const baseContext = [
    "### INSTRUCOES DO SISTEMA ###",
    "VOCE E: O atendente virtual profissional de Lucas, um engenheiro de software senior e arquiteto de solucoes.",
    "SEU OBJETIVO: Qualificar potenciais clientes, demonstrar autoridade tecnica e direcionar contatos comerciais para o WhatsApp.",
    "",
    "### DIRETRIZES DE COMUNICACAO ###",
    "- IDIOMA: Responda sempre em Portugues do Brasil.",
    "- TOM: Consultivo, direto e seguro. Explique brevemente o valor tecnico quando fizer sentido.",
    "- FOCO: Resolucao de problemas de negocio por meio de tecnologia.",
    "",
    "### REGRAS CRITICAS ###",
    "1. PRECO/ORCAMENTO: Se perguntarem sobre valores, custos ou estimativas, diga que precisa analisar o escopo tecnico e envie o link: [Falar com Lucas no WhatsApp](https://wa.me/5542999839219?text=Ola%2C%20tenho%20interesse%20em%20um%20projeto).",
    "2. ESCOPO: Se o assunto fugir de TI, software, carreira ou negocios, explique que voce e focado nos negocios do Lucas e redirecione para desenvolvimento de software ou agendamento.",
    "3. PRESENCA HUMANA: Se pedirem para falar com Lucas, nao finja ser o humano. Explique que voce e a IA do Lucas e envie: [Falar com Lucas no WhatsApp](https://wa.me/5542999839219).",
    "",
    "### BASE DE CONHECIMENTO ###",
  ].join("\n");

  const knowledge = (data ?? [])
    .map((info: SystemInfo) => {
      const topic = (info.topic ?? "Sem topico").toUpperCase();
      return `-- INICIO DO TOPICO: ${topic} --\n${info.content ?? ""}\n-- FIM DO TOPICO --`;
    })
    .join("\n\n");

  return `${baseContext}\n${knowledge}\n\n### INSTRUCAO FINAL ###\nSempre termine perguntando se faz sentido para o negocio do cliente ou se ele gostaria de aprofundar em uma reuniao.`;
}

async function saveMessage(content: string, sender: Sender) {
  const { error } = await supabase.from("message").insert({
    content,
    sender,
    timestamp: new Date().toISOString(),
  });

  if (error) throw error;
}

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
    return jsonResponse({ content: "O controle de uso esta indisponivel no momento. Tente novamente em instantes." }, 503);
  }

  if ((hourlyCount ?? 0) >= hourlyLimit) {
    return jsonResponse({ content: "Limite de mensagens por hora atingido. Tente novamente mais tarde." }, 429);
  }

  const { count: dailyCount, error: dailyError } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("scope", scope)
    .eq("client_hash", clientHash)
    .gte("created_at", dayAgo);

  if (dailyError) {
    console.error(dailyError);
    return jsonResponse({ content: "O controle de uso esta indisponivel no momento. Tente novamente em instantes." }, 503);
  }

  if ((dailyCount ?? 0) >= dailyLimit) {
    return jsonResponse({ content: "Limite diario de mensagens atingido. Tente novamente amanha." }, 429);
  }

  const { error: insertError } = await supabase
    .from("rate_limit_events")
    .insert({ scope, client_hash: clientHash });

  if (insertError) {
    console.error(insertError);
    return jsonResponse({ content: "O controle de uso esta indisponivel no momento. Tente novamente em instantes." }, 503);
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
