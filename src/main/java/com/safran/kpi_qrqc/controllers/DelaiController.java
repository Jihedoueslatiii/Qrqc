package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.Interfaces.DelaiApi;
import com.safran.kpi_qrqc.entities.Delai;
import com.safran.kpi_qrqc.repository.DelaiRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
public class DelaiController implements DelaiApi {

    @Autowired
    private DelaiRepo repository;

    @Override
    public List<Delai> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Delai> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Delai create(Delai delai) {
        delai.setResultat(0.0); // Ignorer toute tentative de saisie manuelle
        return repository.save(delai);
    }

    @Override
    public Delai update(Long id, Delai delai) {
        delai.setId(id);
        delai.setResultat(0.0); // Ignorer toute tentative de saisie manuelle
        return repository.save(delai);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Delai> getByDate(LocalDate date) {
        return repository.findByDate(date);
    }

    @Override
    public String compareResultatToObjectif(Long id) {
        Delai delai = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Délai non trouvé pour l'ID : " + id));
        return delai.getResultat() >= delai.getObjectif() ? "Objectif atteint" : "Objectif non atteint";
    }
    @Override
    public double getAverageResultat() {
        List<Delai> allDelai = repository.findAll();
        if (allDelai.isEmpty()) {
            return 0.0;
        }
        return allDelai.stream()
                .mapToDouble(Delai::getResultat)
                .average()
                .orElse(0.0);
    }
}