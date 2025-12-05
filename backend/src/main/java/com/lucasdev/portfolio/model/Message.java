package com.lucasdev.portfolio.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    private Sender sender; // USER or ASSISTANT

    private LocalDateTime timestamp;

    @Column(length = 1000) // For project card JSON or similar if needed, or just text
    private String metadata; // To store project card info if any

    public enum Sender {
        USER, ASSISTANT
    }
}
