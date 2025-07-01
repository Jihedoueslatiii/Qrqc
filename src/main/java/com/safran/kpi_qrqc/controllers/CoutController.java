package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.Interfaces.CoutApi;
import com.safran.kpi_qrqc.entities.Cout;
import com.safran.kpi_qrqc.repository.CoutRepo;
import com.safran.kpi_qrqc.repository.QualiteRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
public class CoutController implements CoutApi {

    @Autowired
    private CoutRepo repository;

    @Override
    public List<Cout> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Cout> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Cout create(Cout cout) {
        cout.setResultat(0.0); // Ignorer toute tentative de saisie manuelle
        return repository.save(cout);
    }

    @Override
    public Cout update(Long id, Cout cout) {
        cout.setId(id);
        cout.setResultat(0.0); // Ignorer toute tentative de saisie manuelle
        return repository.save(cout);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Cout> getByDate(LocalDate date) {
        return repository.findByDate(date);
    }

    @Override
    public String compareResultatToObjectif(Long id) {
        Cout cout = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coût non trouvé pour l'ID : " + id));
        return cout.getResultat() >= cout.getObjectif() ? "Objectif atteint" : "Objectif non atteint";
    }@Override
    public double getAverageResultat() {
        List<Cout> allCout = repository.findAll();
        if (allCout.isEmpty()) {
            return 0.0;
        }
        return allCout.stream()
                .mapToDouble(Cout::getResultat)
                .average()
                .orElse(0.0);
    }

}