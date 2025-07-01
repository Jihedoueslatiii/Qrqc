package com.safran.kpi_qrqc.Interfaces;

import com.safran.kpi_qrqc.entities.ChatDTO;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public interface ChatbotApi {

    @PostMapping
    ChatDTO.ChatResponse chat(@RequestBody ChatDTO.ChatRequest request);

}
