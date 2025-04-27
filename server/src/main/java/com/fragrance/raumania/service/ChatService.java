package com.fragrance.raumania.service;

import com.fragrance.raumania.dto.response.chat.ChatBotResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final RestTemplate restTemplate;

    @Value("${chatbot.url}")
    private String chatbotUrl;

    public String askChatBot(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("prompt", prompt);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);

        ChatBotResponse response = null;
        try {
            response = restTemplate.postForObject(chatbotUrl + "/ask", request, ChatBotResponse.class);
        } catch (Exception e) {
            log.error("Error while calling chatbot", e);
            return "Sorry, there was an issue connecting to the chatbot.";
        }

        if (response == null || response.getResponse() == null || response.getResponse().isEmpty()) {
            log.warn("Chatbot returned no valid response");
            return "Sorry, the chatbot could not provide an answer.";
        }

        return response.getResponse();
    }
}
