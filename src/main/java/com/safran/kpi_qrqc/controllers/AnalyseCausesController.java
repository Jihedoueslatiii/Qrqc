package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.Interfaces.AnalyseCausesApi;
import com.safran.kpi_qrqc.entities.AnalyseCauses;
import com.safran.kpi_qrqc.repository.AnalyseCausesRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
public class AnalyseCausesController implements AnalyseCausesApi {

    @Autowired
    private AnalyseCausesRepo repository;

    @Override
    public List<AnalyseCauses> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<AnalyseCauses> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public AnalyseCauses create(AnalyseCauses analyse) {
        return repository.save(analyse);
    }

    @Override
    public AnalyseCauses update(Long id, AnalyseCauses analyse) {
        analyse.setId(id);
        return repository.save(analyse);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<AnalyseCauses> getBySemaine(int semaine) {
        return repository.findBySemaine(semaine);
    }

    @Override
    public List<AnalyseCauses> getByIndicateur(String indicateur) {
        return repository.findByIndicateur(indicateur);
    }
}