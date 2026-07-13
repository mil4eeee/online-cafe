package com.cafe.onlinecafe.service;

import com.cafe.onlinecafe.dto.ChatRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class ChatService {

    private final MenuService menuService;
    private final WebClient webClient;

    public ChatService(MenuService menuService) {
        this.menuService = menuService;
        this.webClient = WebClient.create("http://127.0.0.1:8000");
    }

    public PythonChatResponse chat(ChatRequest request) {
        String menu = menuService.getMenuJson();

        PythonChatRequest pythonRequest = new PythonChatRequest(
                request.getMessage(),
                menu
        );

        PythonChatResponse response = webClient.post()
                .uri("/chat")
                .bodyValue(pythonRequest)
                .retrieve()
                .bodyToMono(PythonChatResponse.class)
                .block();

        if (response == null) {
            return new PythonChatResponse(
                    "Sorry, the chatbot is not responding right now.",
                    List.of()
            );
        }

        return response;
    }

    public record PythonChatRequest(String message, String menu) {}

    public record PythonChatResponse(
            String reply,
            List<ChatItem> items
    ) {}

    public record ChatItem(
            String id,
            String name,
            String price,
            String image
    ) {}
}