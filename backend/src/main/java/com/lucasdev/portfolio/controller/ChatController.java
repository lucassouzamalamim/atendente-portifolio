package com.lucasdev.portfolio.controller;

import com.lucasdev.portfolio.model.ChatRequest;
import com.lucasdev.portfolio.model.ChatResponse;
import com.lucasdev.portfolio.model.Message;
import com.lucasdev.portfolio.repository.MessageRepository;
import com.lucasdev.portfolio.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173") // Allow Vite frontend
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private MessageRepository messageRepository;

    @PostMapping
    public ChatResponse sendMessage(@RequestBody ChatRequest request) {
        return chatService.processMessage(request.getMessage());
    }

    @GetMapping("/history")
    public List<Message> getHistory() {
        return messageRepository.findAllByOrderByTimestampAsc();
    }
}
