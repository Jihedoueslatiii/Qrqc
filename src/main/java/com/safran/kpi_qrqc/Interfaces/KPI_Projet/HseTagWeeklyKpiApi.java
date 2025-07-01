package com.safran.kpi_qrqc.Interfaces.KPI_Projet;

import com.safran.kpi_qrqc.entities.KPI_Projet.HseTagWeeklyKpi;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/hse-tag-weekly")
@CrossOrigin(origins = "*")
public interface HseTagWeeklyKpiApi {

    @GetMapping
    List<HseTagWeeklyKpi> getAllHseTagWeeklyKpis();

    @GetMapping("/{id}")
    Optional<HseTagWeeklyKpi> getHseTagWeeklyKpiById(@PathVariable Long id);

    @PostMapping
    HseTagWeeklyKpi createHseTagWeeklyKpi(@RequestBody HseTagWeeklyKpi kpi, @RequestParam String pilot);

    @PutMapping("/{id}")
    HseTagWeeklyKpi updateHseTagWeeklyKpi(@PathVariable Long id, @RequestBody HseTagWeeklyKpi kpi, @RequestParam String pilot);

    @DeleteMapping("/{id}")
    void deleteHseTagWeeklyKpi(@PathVariable Long id);

    @PostMapping("/update")
    HseTagWeeklyKpi updateHseTagWeeklyKpiData(@RequestBody HseTagWeeklyKpi kpi, @RequestParam String pilot);
}