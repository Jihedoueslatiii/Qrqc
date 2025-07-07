package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.Service.EmailSenderService;
import com.safran.kpi_qrqc.entities.Qualite;
import com.safran.kpi_qrqc.entities.Cout;
import com.safran.kpi_qrqc.entities.Delai;
import com.safran.kpi_qrqc.repository.QualiteRepo;
import com.safran.kpi_qrqc.repository.CoutRepo;
import com.safran.kpi_qrqc.repository.DelaiRepo;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class KpiAlertController {

    @Autowired private QualiteRepo qualiteRepo;
    @Autowired private DelaiRepo delaiRepo;
    @Autowired private CoutRepo coutRepo;
    @Autowired private EmailSenderService emailSenderService;

    private final double THRESHOLD = 90.0;

    public static class KpiAlert {
        public String kpiType;
        public String project;
        public double average;
        public boolean alert;
        public String message;

        public KpiAlert(String kpiType, String project, double average, boolean alert, String message) {
            this.kpiType = kpiType;
            this.project = project;
            this.average = average;
            this.alert = alert;
            this.message = message;
        }
    }

    /**
     * 📬 This endpoint generates the KPI HTML report and sends it to a list of email addresses provided by frontend.
     * @param receivers List of email addresses.
     * @return List of KPI alert results per KPI/project.
     */
    @PostMapping("/check")
    public List<KpiAlert> checkKpiAlertsWithReceivers(@RequestBody List<String> receivers) {
        List<KpiAlert> results = new ArrayList<>();

        // Collect KPI averages by type
        Map<String, Double> qualiteMap = qualiteRepo.findAll().stream()
                .collect(Collectors.groupingBy(Qualite::getKPI, Collectors.averagingDouble(Qualite::getResultat)));

        Map<String, Double> delaiMap = delaiRepo.findAll().stream()
                .collect(Collectors.groupingBy(Delai::getKpi, Collectors.averagingDouble(Delai::getResultat)));

        Map<String, Double> coutMap = coutRepo.findAll().stream()
                .collect(Collectors.groupingBy(Cout::getKpi, Collectors.averagingDouble(Cout::getResultat)));

        // Merge all project names
        Set<String> allProjects = new HashSet<>();
        allProjects.addAll(qualiteMap.keySet());
        allProjects.addAll(delaiMap.keySet());
        allProjects.addAll(coutMap.keySet());

        String logoUrl = "https://upload.wikimedia.org/wikipedia/fr/thumb/5/5f/Safran_-_logo_2016.png/1200px-Safran_-_logo_2016.png";

        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family: Arial, sans-serif; max-width: 800px; margin: auto;'>");
        html.append("<div style='text-align: center; margin-bottom: 20px;'>")
                .append("<img src='").append(logoUrl).append("' alt='Company Logo' style='max-height: 80px;'>")
                .append("<h2 style='color: #2c3e50;'>📊 KPI Report Summary</h2>")
                .append("<p style='font-size: 14px; color: #555;'>Threshold: <strong>").append(THRESHOLD).append("%</strong></p>")
                .append("</div>");

        for (String project : allProjects) {
            html.append("<div style='border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px;'>");
            html.append("<h3 style='color: #34495e;'>📁 Project: ").append(project).append("</h3>");
            html.append("<table style='width: 100%; border-collapse: collapse;'>");
            html.append("<tr style='background-color: #f2f2f2;'><th align='left'>KPI Type</th><th>Average</th><th>Status</th></tr>");

            double qualite = qualiteMap.getOrDefault(project, -1.0);
            if (qualite != -1) {
                boolean alert = qualite < THRESHOLD;
                results.add(new KpiAlert("Qualité", project, qualite, alert, ""));
                html.append("<tr>")
                        .append("<td>Qualité</td>")
                        .append("<td>").append(String.format("%.2f", qualite)).append("%</td>")
                        .append("<td style='color:").append(alert ? "red" : "green").append(";'>")
                        .append(alert ? "⚠️ Alert" : "✅ OK").append("</td>")
                        .append("</tr>");
            }

            double delai = delaiMap.getOrDefault(project, -1.0);
            if (delai != -1) {
                boolean alert = delai < THRESHOLD;
                results.add(new KpiAlert("Délai", project, delai, alert, ""));
                html.append("<tr>")
                        .append("<td>Délai</td>")
                        .append("<td>").append(String.format("%.2f", delai)).append("%</td>")
                        .append("<td style='color:").append(alert ? "red" : "green").append(";'>")
                        .append(alert ? "⚠️ Alert" : "✅ OK").append("</td>")
                        .append("</tr>");
            }

            double cout = coutMap.getOrDefault(project, -1.0);
            if (cout != -1) {
                boolean alert = cout < THRESHOLD;
                results.add(new KpiAlert("Coût", project, cout, alert, ""));
                html.append("<tr>")
                        .append("<td>Coût</td>")
                        .append("<td>").append(String.format("%.2f", cout)).append("%</td>")
                        .append("<td style='color:").append(alert ? "red" : "green").append(";'>")
                        .append(alert ? "⚠️ Alert" : "✅ OK").append("</td>")
                        .append("</tr>");
            }

            html.append("</table></div>");
        }

        html.append("<p style='text-align: center; font-size: 13px; color: #999;'>KPI Report generated automatically on ")
                .append(new Date()).append("</p>");
        html.append("</div>");

        // ✅ Send email to each provided receiver
        for (String email : receivers) {
            emailSenderService.sendHtmlEmail(
                    email,
                    "📊 KPI Report by Project",
                    html.toString()
            );
        }

        return results;
    }
}
