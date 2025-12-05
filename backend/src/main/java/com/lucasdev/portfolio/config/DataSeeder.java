package com.lucasdev.portfolio.config;

import com.lucasdev.portfolio.model.Project;
import com.lucasdev.portfolio.model.SystemInfo;
import com.lucasdev.portfolio.repository.ProjectRepository;
import com.lucasdev.portfolio.repository.SystemInfoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder implements CommandLineRunner {

    private final SystemInfoRepository systemInfoRepository;
    private final ProjectRepository projectRepository;

    public DataSeeder(SystemInfoRepository systemInfoRepository, ProjectRepository projectRepository) {
        this.systemInfoRepository = systemInfoRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (systemInfoRepository.count() == 0) {
            System.out.println("Seeding initial SystemInfo data...");

            createSystemInfo("Sobre Mim",
                    "Meu nome é Lucas, sou um engenheiro de software especializado em construir aplicações web escaláveis. Tenho 5 anos de experiência.");
            createSystemInfo("Habilidades", "Java, Spring Boot, React, TypeScript, PostgreSQL, Docker, AWS.");
            createSystemInfo("Projetos",
                    "1. Plataforma SaaS para Logística.\n2. Dashboard E-commerce com analytics em tempo real.\n3. Integração de Chatbot com IA.");
            createSystemInfo("Contato", "Email: lucas@dev.com\nLinkedIn: linkedin.com/in/lucasdev");

            System.out.println("SystemInfo seeding completed.");
        }

        if (projectRepository.count() == 0) {
            System.out.println("Seeding initial Project data...");
            createProject("Plataforma SaaS Logística",
                    "Sistema completo para gestão de frotas e rastreamento em tempo real.", "React, Node.js, AWS",
                    "https://github.com/lucasdev/logistica-saas", "https://via.placeholder.com/300/09f/fff.png");
            createProject("Dashboard E-commerce",
                    "Painel administrativo com gráficos e relatórios financeiros automatizados.",
                    "Vue.js, Python, PostgreSQL", "https://github.com/lucasdev/dashboard-ecommerce",
                    "https://via.placeholder.com/300/e91e63/fff.png");
            createProject("Chatbot IA",
                    "Assistente virtual inteligente integrado ao WhatsApp para atendimento automático.",
                    "Java, Spring Boot, Gemini API", "https://github.com/lucasdev/chatbot-ai",
                    "https://via.placeholder.com/300/4caf50/fff.png");
            System.out.println("Project seeding completed.");
        }
    }

    private void createSystemInfo(String topic, String content) {
        SystemInfo info = new SystemInfo();
        info.setTopic(topic);
        info.setContent(content);
        systemInfoRepository.save(info);
    }

    private void createProject(String title, String description, String tech, String url, String imageUrl) {
        Project project = new Project();
        project.setTitle(title);
        project.setDescription(description);
        project.setTechnology(tech);
        project.setUrl(url);
        project.setImageUrl(imageUrl);
        projectRepository.save(project);
    }
}
