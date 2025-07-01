package com.safran.kpi_qrqc.Interfaces;

import com.safran.kpi_qrqc.entities.KPI;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
public interface KPIApi {

    @GetMapping
    List<KPI> getAllKPIs();

    @GetMapping("/{id}")
    Optional<KPI> getKPIById(@PathVariable Long id);

    @PostMapping
    KPI createKPI(@RequestBody KPI kpi, @RequestParam String pilot);

    @PutMapping("/{id}")
    KPI updateKPI(@PathVariable Long id, @RequestBody KPI kpi, @RequestParam String pilot);

    @DeleteMapping("/{id}")
    void deleteKPI(@PathVariable Long id);

//    @GetMapping("/date/{date}")
//    List<KPI> getKPIsByDate(@PathVariable String date);
}