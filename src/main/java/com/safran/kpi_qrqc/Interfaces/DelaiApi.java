package com.safran.kpi_qrqc.Interfaces;

import com.safran.kpi_qrqc.entities.Delai;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RequestMapping("/delai")
@CrossOrigin(origins = "*")
public interface DelaiApi {

    @GetMapping
    List<Delai> getAll();

    @GetMapping("/{id}")
    Optional<Delai> getById(@PathVariable Long id);

    @PostMapping
    Delai create(@RequestBody Delai delai);

    @PutMapping("/{id}")
    Delai update(@PathVariable Long id, @RequestBody Delai delai);

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id);

    @GetMapping("/date/{date}")
    List<Delai> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date);

    @GetMapping("/compare/{id}")
    String compareResultatToObjectif(@PathVariable Long id);
    @GetMapping("/average")
    double getAverageResultat();
}