package com.safran.kpi_qrqc.controllers.KPI_Projet_controllers;


import com.safran.kpi_qrqc.Interfaces.KPI_Projet.HseTagWeeklyKpiApi;
import com.safran.kpi_qrqc.entities.KPI_Projet.HseTagWeeklyKpi;
import com.safran.kpi_qrqc.repository.KPI_Projet.HseTagWeeklyKpiRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

@RestController
public class HseTagWeeklyKpiController implements HseTagWeeklyKpiApi {

    @Autowired
    private HseTagWeeklyKpiRepo hseTagWeeklyKpiRepo;

    @Override
    public List<HseTagWeeklyKpi> getAllHseTagWeeklyKpis() {
        return hseTagWeeklyKpiRepo.findAll();
    }

    @Override
    public Optional<HseTagWeeklyKpi> getHseTagWeeklyKpiById(Long id) {
        return hseTagWeeklyKpiRepo.findById(id);
    }

    @Override
    public HseTagWeeklyKpi createHseTagWeeklyKpi(HseTagWeeklyKpi kpi, String pilot) {
        kpi.setPilot(pilot);
        calculateAutomaticValues(kpi);
        return hseTagWeeklyKpiRepo.save(kpi);
    }

    @Override
    public HseTagWeeklyKpi updateHseTagWeeklyKpi(Long id, HseTagWeeklyKpi kpi, String pilot) {
        kpi.setId(id);
        kpi.setPilot(pilot);
        calculateAutomaticValues(kpi);
        return hseTagWeeklyKpiRepo.save(kpi);
    }

    @Override
    public void deleteHseTagWeeklyKpi(Long id) {
        hseTagWeeklyKpiRepo.deleteById(id);
    }

    @Override
    public HseTagWeeklyKpi updateHseTagWeeklyKpiData(HseTagWeeklyKpi kpi, String pilot) {
        kpi.setPilot(pilot);
        calculateAutomaticValues(kpi);
        return hseTagWeeklyKpiRepo.save(kpi);
    }

    // Method to calculate automatic values
    private void calculateAutomaticValues(HseTagWeeklyKpi kpi) {
        if (kpi.getWeeklyTags() == null || kpi.getWeeklyTags().isEmpty()) {
            return; // No data to process
        }

        // Convert week strings (e.g., "01-2025") to LocalDate
        TreeMap<LocalDate, Integer> sortedWeeklyTags = new TreeMap<>();
        DateTimeFormatter weekFormatter = DateTimeFormatter.ofPattern("ww-yyyy"); // Matches "01-2025"
        for (String week : kpi.getWeeklyTags().keySet()) {
            try {
                // Parse the week string and approximate to the first day of the week in 2025
                LocalDate date = LocalDate.parse("2025-" + week, weekFormatter)
                        .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                sortedWeeklyTags.put(date, kpi.getWeeklyTags().get(week));
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid week format: " + week + ". Use WW-YYYY (e.g., 01-2025).");
            }
        }

        // Update the entity's weeklyTags with converted dates
        kpi.setWeeklyTags(new TreeMap<>()); // Clear and reinitialize to avoid duplication
        for (Map.Entry<LocalDate, Integer> entry : sortedWeeklyTags.entrySet()) {
            kpi.getWeeklyTags().put(DateTimeFormatter.ofPattern("ww-yyyy").format(entry.getKey()), entry.getValue());
        }

        // Calculate cumulative tags
        int cumTag = 0;
        for (LocalDate date : sortedWeeklyTags.keySet()) {
            cumTag += sortedWeeklyTags.get(date);
            kpi.getCumulativeTags().put(date, cumTag);
        }

        // Set weekly objectives (alternating 0 and 1, starting with 0 for week 1)
        LocalDate firstDate = sortedWeeklyTags.firstKey();
        int weekNumber = 1; // Start with week 1
        for (LocalDate date : sortedWeeklyTags.keySet()) {
            int objective = (weekNumber % 2 == 1) ? 0 : 1; // 0 for odd weeks (1, 3, ...), 1 for even weeks (2, 4, ...)
            kpi.getWeeklyObjectives().put(date, objective);
            weekNumber++; // Increment week number
        }

        // Calculate cumulative objectives
        int cumObj = 0;
        for (LocalDate date : sortedWeeklyTags.keySet()) {
            int currentWeeklyObj = kpi.getWeeklyObjectives().getOrDefault(date, 0);
            cumObj += currentWeeklyObj;
            kpi.getCumulativeObjectives().put(date, cumObj);
        }
    }
}