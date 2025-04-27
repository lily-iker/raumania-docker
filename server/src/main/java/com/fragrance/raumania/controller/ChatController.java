package com.fragrance.raumania.controller;

import com.fragrance.raumania.dto.response.ApiResponse;
import com.fragrance.raumania.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/ask")
    public ResponseEntity<?> askChatBot(@RequestParam(name = "prompt") String prompt) {
        return ResponseEntity.ok(
                new ApiResponse<>(200,
                        "Chatbot response retrieved successfully",
                        chatService.askChatBot(prompt))
        );
    }
}
