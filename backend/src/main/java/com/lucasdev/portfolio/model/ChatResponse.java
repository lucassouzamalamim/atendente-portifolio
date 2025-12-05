package com.lucasdev.portfolio.model;

import lombok.Data;

@Data
public class ChatResponse {
    private String content;
    private ProjectCard projectCard; // Mantendo para compatibilidade ou pode remover se substituir tudo
    private java.util.List<Project> projects;

    @Data
    public static class ProjectCard {
        private String title;
        private String desc;
        private String tech;
    }
}
