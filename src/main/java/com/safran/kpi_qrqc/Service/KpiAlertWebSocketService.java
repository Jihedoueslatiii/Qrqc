package com.safran.kpi_qrqc.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class KpiAlertWebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendKpiAlert(String message) {
        messagingTemplate.convertAndSend("/topic/kpi-alert", message);
    }
}