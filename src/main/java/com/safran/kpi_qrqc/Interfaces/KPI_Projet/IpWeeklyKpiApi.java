package com.safran.kpi_qrqc.Interfaces.KPI_Projet;

import com.safran.kpi_qrqc.entities.KPI_Projet.IpWeeklyKpi;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/ip-weekly")
@CrossOrigin(origins = "*")
public interface IpWeeklyKpiApi {

    @GetMapping
    List<IpWeeklyKpi> getAllIpWeeklyKpis();

    @GetMapping("/{id}")
    Optional<IpWeeklyKpi> getIpWeeklyKpiById(@PathVariable Long id);

    @PostMapping
    IpWeeklyKpi createIpWeeklyKpi(@RequestBody IpWeeklyKpi kpi, @RequestParam String pilot);

    @PutMapping("/{id}")
    IpWeeklyKpi updateIpWeeklyKpi(@PathVariable Long id, @RequestBody IpWeeklyKpi kpi, @RequestParam String pilot);

    @DeleteMapping("/{id}")
    void deleteIpWeeklyKpi(@PathVariable Long id);

    @PostMapping("/update")
    IpWeeklyKpi updateIpWeeklyKpiData(@RequestBody IpWeeklyKpi kpi, @RequestParam String pilot);
}