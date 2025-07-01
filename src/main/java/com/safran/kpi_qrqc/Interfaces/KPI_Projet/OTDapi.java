package com.safran.kpi_qrqc.Interfaces.KPI_Projet;

import com.safran.kpi_qrqc.entities.KPI_Projet.OTD;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RequestMapping("/livrables")
@CrossOrigin(origins = "*")
public interface OTDapi {
    @PostMapping
    OTD create(@RequestBody OTD otd);

    @GetMapping
    List<OTD> getAll();

    @GetMapping("/{id}")
    OTD getOne(@PathVariable Long id);

    @PutMapping("/{id}")
    OTD update(@PathVariable Long id, @RequestBody OTD otd);

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id);

    @PostMapping("/calcul")
    OTD calculerTaux(@RequestBody OTD otd);

    @GetMapping("/objectif")
    String objectif();

}
