package com.lucasdev.portfolio.service;

import com.lucasdev.portfolio.model.ChatResponse;
import com.lucasdev.portfolio.model.Message;
import com.lucasdev.portfolio.repository.MessageRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private com.lucasdev.portfolio.repository.SystemInfoRepository systemInfoRepository;

    @Autowired
    private com.lucasdev.portfolio.repository.ProjectRepository projectRepository;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public ChatResponse processMessage(String userMessage) {
        // Save User Message
        Message userMsg = new Message();
        userMsg.setContent(userMessage);
        userMsg.setSender(Message.Sender.USER);
        userMsg.setTimestamp(LocalDateTime.now());
        messageRepository.save(userMsg);

        ChatResponse response = new ChatResponse();
        String lowerMsg = userMessage.toLowerCase();

        // Check for project keywords
        if (lowerMsg.contains("projetos") || lowerMsg.contains("cases") || lowerMsg.contains("trabalhos")
                || lowerMsg.contains("portfolio")) {
            List<com.lucasdev.portfolio.model.Project> projects = projectRepository.findAll();
            response.setProjects(projects);
            response.setContent(
                    "Aqui estão alguns dos projetos recentes que desenvolvi. Clique em 'Visualizar' para ver mais detalhes:");
        } else {
            // Generate AI Response
            String context = buildSystemContext();
            String fullPrompt = context + "\n\nUser Message: " + userMessage;
            response = callGeminiApi(fullPrompt);
        }

        // Save AI Message
        Message aiMsg = new Message();
        aiMsg.setContent(response.getContent());
        aiMsg.setSender(Message.Sender.ASSISTANT);
        aiMsg.setTimestamp(LocalDateTime.now());
        messageRepository.save(aiMsg);

        return response;
    }

    private ChatResponse callGeminiApi(String text) {
        ChatResponse response = new ChatResponse();

        try {
            // Check if API Key is set
            if (geminiApiKey == null || geminiApiKey.contains("YOUR_API_KEY") || geminiApiKey.isEmpty()) {
                response.setContent(
                        "Configuração da API inválida. Por favor, configure a chave da API Gemini no backend.");
                return response;
            }

            // Create Request Body
            GeminiRequest request = new GeminiRequest();
            request.setContents(Collections.singletonList(new GeminiRequest.Content(
                    Collections.singletonList(new GeminiRequest.Part(text)))));

            // Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<GeminiRequest> entity = new HttpEntity<>(request, headers);

            // Call API
            GeminiResponse apiResponse = restTemplate.postForObject(geminiApiUrl, entity, GeminiResponse.class);

            // Parse Response
            if (apiResponse != null && apiResponse.getCandidates() != null && !apiResponse.getCandidates().isEmpty()) {
                String aiText = apiResponse.getCandidates().get(0).getContent().getParts().get(0).getText();
                response.setContent(aiText);
            } else {
                response.setContent("Desculpe, não consegui processar sua solicitação no momento.");
            }

        } catch (Exception e) {
            e.printStackTrace();
            // Fallback for demo showing the error or switching to static responses for
            // resilience
            response.setContent("Erro ao conectar com a IA: " + e.getMessage());
        }

        return response;
    }

    private String buildSystemContext() {
        StringBuilder sb = new StringBuilder();

        // 1. Definição da Persona e Objetivo
        sb.append("### INSTRUÇÕES DO SISTEMA ###\n");
        sb.append(
                "VOCÊ É: O 'Gêmeo Digital' profissional de Lucas, um Engenheiro de Software Sênior e Arquiteto de Soluções.\n");
        sb.append(
                "SEU OBJETIVO: Atender potenciais clientes, demonstrar autoridade técnica e direcioná-los para uma conversa comercial no WhatsApp.\n");

        // 2. Regras de Comunicação
        sb.append("\n### DIRETRIZES DE COMUNICAÇÃO ###\n");
        sb.append("- IDIOMA: Responda SEMPRE em Português do Brasil (PT-BR), formal mas acessível.\n");
        sb.append(
                "- TOM DE VOZ: Confiança de sênior. Seja consultivo. Em vez de apenas dizer 'sim', explique brevemente o 'porquê' técnico para demonstrar valor.\n");
        sb.append("- PERSONALIDADE: Você é focado em resolução de problemas de negócios através da tecnologia.\n");

        // 3. Guardrails (Regras de Ouro)
        sb.append("\n### REGRAS CRÍTICAS (NÃO QUEBRE) ###\n");

        // Regra de Preço Refinada (Mais comercial)
        sb.append("1. PREÇO/ORÇAMENTO: Se perguntarem sobre valores, custos ou estimativas, diga: ");
        sb.append(
                "'Para garantir um orçamento justo e preciso, preciso analisar o escopo técnico detalhadamente. Vamos agendar uma rápida conversa?' ");
        sb.append(
                "E forneça IMEDIATAMENTE este link: [Falar com Lucas no WhatsApp](https://wa.me/5542999839219?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20um%20projeto).\n");

        // Regra de Escopo (Mais educada, menos rude)
        sb.append("2. ESCOPO: Se o assunto fugir de TI, Software, Carreira ou Negócios, responda: ");
        sb.append(
                "'Como assistente virtual focado nos negócios do Lucas, não tenho informações sobre esse tema. Mas posso te ajudar com dúvidas sobre desenvolvimento de software ou agendamento de projetos.'\n");

        // 4. Injeção de Contexto Dinâmico (RAG simplificado)
        sb.append("\n### BASE DE CONHECIMENTO (O QUE O LUCAS SABE/FEZ) ###\n");
        sb.append("Use as informações abaixo para responder perguntas sobre experiência, stack e projetos:\n\n");

        // --- NOVA REGRA PARA CORRIGIR O "ESTOU AQUI" ---
        sb.append(
                "3. PRESENÇA HUMANA: Se perguntarem 'Cadê o Lucas?', 'Quero falar com o Lucas', 'Você é real?' ou 'Posso ligar?':\n");
        sb.append("   - NUNCA diga 'Estou aqui' ou finja ser o humano nesse momento.\n");
        sb.append(
                "   - RESPONDA: 'Eu sou a inteligência artificial do Lucas agilizando o atendimento. O Lucas (humano) está focado em projetos agora. Para falar diretamente com ele, chame aqui:'\n");
        sb.append(
                "   - AÇÃO OBRIGATÓRIA: Forneça o link do whatsapp do lucas: [Falar com Lucas no WhatsApp](https://wa.me/5542999839219).\n");

        List<com.lucasdev.portfolio.model.SystemInfo> infos = systemInfoRepository.findAll();

        if (infos.isEmpty()) {
            sb.append(
                    "Nenhuma informação específica carregada no momento. Peça para o usuário entrar em contato direto.\n");
        } else {
            for (com.lucasdev.portfolio.model.SystemInfo info : infos) {
                sb.append("-- INÍCIO DO TÓPICO: ").append(info.getTopic().toUpperCase()).append(" --\n");
                sb.append(info.getContent()).append("\n");
                sb.append("-- FIM DO TÓPICO --\n\n");
            }
        }

        // 5. Instrução Final de Fechamento
        sb.append("\n### INSTRUÇÃO FINAL ###\n");
        sb.append(
                "Sempre que explicar algo técnico ou apresentar um serviço, termine perguntando se faz sentido para o negócio do cliente ou se ele gostaria de aprofundar isso numa reunião.\n");

        return sb.toString();
    }

    // DTOs for Gemini API
    @Data
    static class GeminiRequest {
        private List<Content> contents;

        @Data
        @AllArgsConstructor
        static class Content {
            private List<Part> parts;
        }

        @Data
        @AllArgsConstructor
        static class Part {
            private String text;
        }
    }

    @Data
    static class GeminiResponse {
        private List<Candidate> candidates;

        @Data
        static class Candidate {
            private Content content;
        }

        @Data
        static class Content {
            private List<Part> parts;
        }

        @Data
        static class Part {
            private String text;
        }
    }
}
