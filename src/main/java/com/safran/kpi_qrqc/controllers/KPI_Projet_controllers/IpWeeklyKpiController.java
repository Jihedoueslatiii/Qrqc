package com.safran.kpi_qrqc.controllers.KPI_Projet_controllers;


import com.safran.kpi_qrqc.Interfaces.KPI_Projet.IpWeeklyKpiApi;
import com.safran.kpi_qrqc.entities.KPI_Projet.IpWeeklyKpi;
import com.safran.kpi_qrqc.repository.KPI_Projet.IpWeeklyKpiRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.TreeMap;

@RestController
public class IpWeeklyKpiController implements IpWeeklyKpiApi {

    @Autowired
    private IpWeeklyKpiRepo ipWeeklyKpiRepo;

    @Override
    public List<IpWeeklyKpi> getAllIpWeeklyKpis() {
        return ipWeeklyKpiRepo.findAll();
    }

    @Override
    public Optional<IpWeeklyKpi> getIpWeeklyKpiById(Long id) {
        return ipWeeklyKpiRepo.findById(id);
    }

    @Override
    public IpWeeklyKpi createIpWeeklyKpi(IpWeeklyKpi kpi, String pilot) {
        kpi.setPilot(pilot);
        calculateAutomaticValues(kpi);
        return ipWeeklyKpiRepo.save(kpi);
    }

    @Override
    public IpWeeklyKpi updateIpWeeklyKpi(Long id, IpWeeklyKpi kpi, String pilot) {
        kpi.setId(id);
        kpi.setPilot(pilot);
        calculateAutomaticValues(kpi);
        return ipWeeklyKpiRepo.save(kpi);
    }

    @Override
    public void deleteIpWeeklyKpi(Long id) {
        ipWeeklyKpiRepo.deleteById(id);
    }

    @Override
    public IpWeeklyKpi updateIpWeeklyKpiData(IpWeeklyKpi kpi, String pilot) {
        kpi.setPilot(pilot);
        calculateAutomaticValues(kpi);
        return ipWeeklyKpiRepo.save(kpi);
    }

    // Method to calculate automatic values
    private void calculateAutomaticValues(IpWeeklyKpi kpi) {
        if (kpi.getWeeklyIPs() == null || kpi.getWeeklyIPs().isEmpty()) {
            return; // No data to process
        }

        // Convert week strings (e.g., "01-2025") to LocalDate
        TreeMap<LocalDate, Integer> sortedWeeklyIPs = new TreeMap<>();
        DateTimeFormatter weekFormatter = DateTimeFormatter.ofPattern("ww-yyyy"); // Matches "01-2025"
        for (String week : kpi.getWeeklyIPs().keySet()) {
            try {
                // Parse the week string and approximate to the first day of the week in 2025
                LocalDate date = LocalDate.parse("2025-" + week, weekFormatter)
                        .with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
                sortedWeeklyIPs.put(date, kpi.getWeeklyIPs().get(week));
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid week format: " + week + ". Use WW-YYYY (e.g., 01-2025).");
            }
        }



        // Calculate cumulative IPs
        int cumIP = 0;
        for (LocalDate date : sortedWeeklyIPs.keySet()) {
            cumIP += sortedWeeklyIPs.get(date);
            kpi.getCumulativeIPs().put(date, cumIP);
        }

        // Set weekly objectives (fixed at 2 for all weeks)
        for (LocalDate date : sortedWeeklyIPs.keySet()) {
            kpi.getWeeklyObjectives().put(date, 2);
        }

        // Calculate cumulative objectives
        int cumObj = 0;
        for (LocalDate date : sortedWeeklyIPs.keySet()) {
            int currentWeeklyObj = kpi.getWeeklyObjectives().getOrDefault(date, 0);
            cumObj += currentWeeklyObj;
            kpi.getCumulativeObjectives().put(date, cumObj);
        }
    }
}