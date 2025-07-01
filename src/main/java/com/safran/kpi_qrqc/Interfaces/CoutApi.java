package com.safran.kpi_qrqc.Interfaces;

import com.safran.kpi_qrqc.entities.Cout;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RequestMapping("/cout")
@CrossOrigin(origins = "*")
public interface CoutApi {

    @GetMapping
    List<Cout> getAll();

    @GetMapping("/{id}")
    Optional<Cout> getById(@PathVariable Long id);

    @PostMapping
    Cout create(@RequestBody Cout cout);

    @PutMapping("/{id}")
    Cout update(@PathVariable Long id, @RequestBody Cout cout);

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id);

    @GetMapping("/date/{date}")
    List<Cout> getByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date);

    @GetMapping("/compare/{id}")
    String compareResultatToObjectif(@PathVariable Long id);
    @GetMapping("/average")
    double getAverageResultat();
}