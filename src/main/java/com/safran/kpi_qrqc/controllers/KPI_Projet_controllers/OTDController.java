package com.safran.kpi_qrqc.controllers.KPI_Projet_controllers;

import com.safran.kpi_qrqc.Interfaces.KPI_Projet.OTDapi;
import com.safran.kpi_qrqc.entities.KPI_Projet.Efficacite;
import com.safran.kpi_qrqc.entities.KPI_Projet.OTD;
import com.safran.kpi_qrqc.repository.OTDRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
    public class OTDController implements OTDapi {
    private final OTDRepository repository;

    public OTDController(OTDRepository repository) {
        this.repository = repository;
    }

    @Override
    public OTD create(OTD otd) {
        return repository.save(calculerTaux(otd));
    }

    @Override
    public List<OTD> getAll() {
        return repository.findAll();
    }

    @Override
    public OTD getOne(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("OTD not found with id " + id));
    }

    @Override
    public OTD update(Long id, OTD newOTD) {
        OTD otd = getOne(id);
        otd.setSemaine(newOTD.getSemaine());
        otd.setRealises(newOTD.getRealises());
        otd.setBacklog(newOTD.getBacklog());
        calculerTaux(otd);
        return repository.save(otd);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public OTD calculerTaux(OTD livrable) {
        int realises = livrable.getRealises();
        int backlog = livrable.getBacklog();
        int total = realises + backlog;
        double taux = (total == 0) ? 0 : (realises * 100.0) / total;
        livrable.setTauxRealisation(taux);
        return livrable;
    }

    @Override
    public String objectif() {
        return "L’objectif hebdomadaire est de 90% de livrables réalisés.";
    }

}
