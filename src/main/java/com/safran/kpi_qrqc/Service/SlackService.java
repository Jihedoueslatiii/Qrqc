package com.safran.kpi_qrqc.Service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SlackService {

    private static final String SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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";

    public void sendSlackMessage(String message) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, String> json = new HashMap<>();
        json.put("text", message);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(json, headers);

        restTemplate.postForEntity(SLACK_WEBHOOK_URL, entity, String.class);
    }
}
