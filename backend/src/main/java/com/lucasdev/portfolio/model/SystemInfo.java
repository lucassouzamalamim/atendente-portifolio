package com.lucasdev.portfolio.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class SystemInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String topic; // e.g., "About Me", "Skills", "Contact"

    @Column(columnDefinition = "TEXT")
    private String content; // The actual context text
}
