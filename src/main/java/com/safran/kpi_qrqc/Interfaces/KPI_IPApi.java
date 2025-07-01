package com.safran.kpi_qrqc.Interfaces;

import com.safran.kpi_qrqc.entities.KPI_IP;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/kpi-ip")
@CrossOrigin(origins = "*")
public interface KPI_IPApi {

    @GetMapping
    List<KPI_IP> getAll();

    @GetMapping("/{id}")
    Optional<KPI_IP> getById(@PathVariable Long id);

    @PostMapping
    KPI_IP create(@RequestBody KPI_IP kpiIp);

    @PutMapping("/{id}")
    KPI_IP update(@PathVariable Long id, @RequestBody KPI_IP kpiIp);

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id);

    @GetMapping("/semaine/{semaine}")
    List<KPI_IP> getBySemaine(@PathVariable int semaine);

    @GetMapping("/annee/{annee}")
    List<KPI_IP> getByAnnee(@PathVariable int annee);

    @GetMapping("/codeip/{codeIp}")
    List<KPI_IP> getByCodeIp(@PathVariable String codeIp);

    @GetMapping("/hsetag/{hseTag}")
    List<KPI_IP> getByHseTag(@PathVariable Boolean hseTag);
}