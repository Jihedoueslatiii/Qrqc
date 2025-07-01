package com.safran.kpi_qrqc.Interfaces;

import com.safran.kpi_qrqc.entities.Qualite;
import com.safran.kpi_qrqc.entities.ResultatQuotidien;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RequestMapping("/qualite")
@CrossOrigin(origins = "*")
public interface QualiteApi {

    @GetMapping
    List<Qualite> getAll();

    @GetMapping("/{id}")
    Optional<Qualite> getById(@PathVariable Long id);

    @PostMapping
    Qualite create(@RequestBody Qualite qualite);

    @PutMapping("/{id}")
    Qualite update(@PathVariable Long id, @RequestBody Qualite qualite);

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id);

    @GetMapping("/date/{date}")
    List<Qualite> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date);

    @GetMapping("/compare/{id}")
    String compareResultatToObjectif(@PathVariable Long id);
    @GetMapping("/average")
    double getAverageResultat();
//   @PostMapping("/{id}/resultats")
//    ResultatQuotidien addResultat(@PathVariable Long id, @RequestBody ResultatQuotidien resultatQuotidien);
//
//    @GetMapping("/{id}/resultats")
//    List<ResultatQuotidien> getResultats(@PathVariable Long id);

    @GetMapping("/{id}/average")
    double getAverageResultatById(@PathVariable Long id);
//    @PostMapping("/{id}/resultats")
//    ResultatQuotidien addResultat(@PathVariable Long id, @RequestBody ResultatQuotidien resultatQuotidien);
//
//    @GetMapping("/{id}/resultats")
//    List<ResultatQuotidien> getResultats(@PathVariable Long id);

    @GetMapping("/average/{pilote}/{kpi}")
    double getAverageResultatByPiloteAndKPI(@PathVariable String pilote, @PathVariable String kpi);


}

