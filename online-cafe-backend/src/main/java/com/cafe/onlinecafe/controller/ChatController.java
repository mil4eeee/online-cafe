package com.cafe.onlinecafe.controller;

import com.cafe.onlinecafe.dto.ChatRequest;
import com.cafe.onlinecafe.service.ChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ChatController {

    private final ChatService chatService;
    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }
    @PostMapping
    public Object chat (@RequestBody ChatRequest request){
        return chatService.chat(request);
    }
}
