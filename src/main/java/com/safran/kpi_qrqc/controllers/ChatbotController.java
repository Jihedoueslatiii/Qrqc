package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.Interfaces.ChatbotApi;
import com.safran.kpi_qrqc.entities.ChatDTO;
import com.safran.kpi_qrqc.entities.Qualite;
import com.safran.kpi_qrqc.repository.QualiteRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
public class ChatbotController implements ChatbotApi {

    @Autowired
    private QualiteRepo qualiteRepo;

    @Override
    public ChatDTO.ChatResponse chat(ChatDTO.ChatRequest request) {
        String msg = request.getMessage().toLowerCase();

        String pilote = ChatParser.extractPilote(msg);
        String kpi = ChatParser.extractKpi(msg);
        LocalDate date = ChatParser.extractDate(msg);

        List<Qualite> results;

        if (pilote != null && kpi != null && date != null) {
            // You might want to add a method findByPiloteAndKPIAndDate, if not exists, fallback:
            results = qualiteRepo.findByPiloteAndKPI(pilote, kpi);
            // optionally filter by date in memory if repo method missing
            results.removeIf(q -> !q.getDate().equals(date));
        } else if (pilote != null && kpi != null) {
            results = qualiteRepo.findByPiloteAndKPI(pilote, kpi);
        } else if (date != null) {
            results = qualiteRepo.findByDate(date);
        } else {
            results = qualiteRepo.findAll();
        }

        if (results.isEmpty()) {
            return new ChatDTO.ChatResponse("Désolé, aucune donnée KPI trouvée pour votre requête.");
        }

        double averageResultat = results.stream()
                .mapToDouble(Qualite::getResultat)
                .average()
                .orElse(0);

        StringBuilder reply = new StringBuilder();

        reply.append("Voici les résultats détaillés pour votre demande:\n\n");

        for (Qualite q : results) {
            reply.append(String.format(
                    "Pilote: %s\n" +
                            "KPI: %s\n" +
                            "Date: %s\n" +
                            "Nombre de pièces non conformes: %d\n" +
                            "Nombre total de pièces: %d\n" +
                            "Résultat: %.2f%%\n" +
                            "Objectif: %.2f%%\n" +
                            "Statut: %s\n\n",
                    q.getPilote(),
                    q.getKPI(),
                    q.getDate(),
                    q.getNombrePiecesNc(),
                    q.getNombrePiecesTotal(),
                    q.getResultat(),
                    q.getObjectif(),
                    q.getResultat() >= q.getObjectif() ? "Objectif atteint ✅" : "Objectif non atteint ❌"
            ));
        }

        reply.append(String.format("Nombre total d'entrées: %d\n", results.size()));
        reply.append(String.format("Moyenne générale du résultat: %.2f%%", averageResultat));

        return new ChatDTO.ChatResponse(reply.toString());
    }

}
