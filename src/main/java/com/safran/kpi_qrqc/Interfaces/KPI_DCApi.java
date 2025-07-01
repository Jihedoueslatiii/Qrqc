package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.entities.KPI_DC;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/kpis")
@CrossOrigin(origins = "*")
public interface KPI_DCApi {

    @GetMapping
    List<KPI_DC> getAllKPIs();

    @GetMapping("/{id}")
    Optional<KPI_DC> getKPIById(@PathVariable Long id);

    @PostMapping
    KPI_DC createKPI(@RequestBody KPI_DC kpi);

    @PutMapping("/{id}")
    KPI_DC updateKPI(@PathVariable Long id, @RequestBody KPI_DC kpi);

    @DeleteMapping("/{id}")
    void deleteKPI(@PathVariable Long id);
}