package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.Interfaces.KPIApi;
import com.safran.kpi_qrqc.Service.SlackService;
import com.safran.kpi_qrqc.entities.KPI;
import com.safran.kpi_qrqc.entities.ProductionData;
import com.safran.kpi_qrqc.repository.KPIRepo;
import com.safran.kpi_qrqc.repository.ProductionDataRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class KPIController implements KPIApi {
    @Autowired
    private SlackService slackService;

    @Autowired
    private KPIRepo kpiRepository;
    @Autowired
    private ProductionDataRepo productionDataRepo;

    @Override
    public List<KPI> getAllKPIs() {
        return kpiRepository.findAll();
    }

    @Override
    public Optional<KPI> getKPIById(Long id) {
        return kpiRepository.findById(id);
    }

    @Override
    public KPI createKPI(KPI kpi, String pilot) {
        kpi.setPilot(pilot); // Set the dynamic pilot
        return kpiRepository.save(kpi);
    }

    @Override
    public KPI updateKPI(Long id, KPI kpi, String pilot) {
        kpi.setId(id);
        kpi.setPilot(pilot); // Set the dynamic pilot
        return kpiRepository.save(kpi);
    }

    @Override
    public void deleteKPI(Long id) {
        kpiRepository.deleteById(id);
    }

//    @Override
//    public List<KPI> getKPIsByDate(String date) {
//        LocalDate localDate = LocalDate.parse(date); // Add error handling in production
//        return kpiRepository.findAll().stream()
//                .filter(kpi -> kpi.getResults().containsKey(localDate))
//                .toList();
//    }

    // Method to calculate and update KPIs with dynamic pilot
    public void calculateKPIs(String pilot) {
        List<ProductionData> data = productionDataRepo.findAll();
        Map<String, Map<LocalDate, Double>> kpiResults = new HashMap<>();

        for (ProductionData d : data) {
            String line = d.getLine();
            LocalDate date = d.getDate();
            int ncPieces = d.getNcPieces();
            int totalPieces = d.getTotalPieces();
            double rate = totalPieces > 0 ? (double) ncPieces / totalPieces * 100 : 0.0;

            kpiResults.computeIfAbsent(line, k -> new HashMap<>()).put(date, rate);
        }

        kpiResults.forEach((line, results) -> {
            KPI kpi = kpiRepository.findAll().stream()
                    .filter(k -> k.getName().contains(line))
                    .findFirst()
                    .orElseGet(() -> {
                        KPI newKpi = new KPI();
                        newKpi.setName("Taux de NC " + line);
                        newKpi.setPilot(pilot);
                        newKpi.setFormula("NC/Total*100");
                        newKpi.setTarget(5.0);
                        return newKpi;
                    });
            kpi.setResults(results);
            kpiRepository.save(kpi);
        });
    }
    @GetMapping("/test-slack")
    public ResponseEntity<String> testSlack() {
        slackService.sendSlackMessage("🚀 Test alert from KPI system!");
        return ResponseEntity.ok("Slack message sent!");
    }
}