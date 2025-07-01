package com.safran.kpi_qrqc.Interfaces;

import com.safran.kpi_qrqc.entities.AnalyseCauses;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/analyse-causes")
@CrossOrigin(origins = "*")
public interface AnalyseCausesApi {

    @GetMapping
    List<AnalyseCauses> getAll();

    @GetMapping("/{id}")
    Optional<AnalyseCauses> getById(@PathVariable Long id);

    @PostMapping
    AnalyseCauses create(@RequestBody AnalyseCauses analyse);

    @PutMapping("/{id}")
    AnalyseCauses update(@PathVariable Long id, @RequestBody AnalyseCauses analyse);

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id);

    @GetMapping("/semaine/{semaine}")
    List<AnalyseCauses> getBySemaine(@PathVariable int semaine);

    @GetMapping("/indicateur/{indicateur}")
    List<AnalyseCauses> getByIndicateur(@PathVariable String indicateur);
}