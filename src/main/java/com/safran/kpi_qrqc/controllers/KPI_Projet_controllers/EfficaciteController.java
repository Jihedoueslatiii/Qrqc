package com.safran.kpi_qrqc.controllers.KPI_Projet_controllers;

import com.safran.kpi_qrqc.Interfaces.KPI_Projet.EfficaciteApi;
import com.safran.kpi_qrqc.entities.KPI_Projet.Efficacite;
import com.safran.kpi_qrqc.repository.KPI_Projet.EfficaciteRepository;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class EfficaciteController implements EfficaciteApi {

    private final EfficaciteRepository repository;
    private static final double OBJECTIF = 90.0;

    public EfficaciteController(EfficaciteRepository repository) {
        this.repository = repository;
    }

    @Override
    public Efficacite calculerEfficacite(Efficacite request) {
        double std = request.getTempsStandard();
        double alloue = request.getTempsAlloue();
        double taux = (alloue == 0) ? 0 : (std * 100.0) / alloue;
        request.setEfficacite(taux);
        return repository.save(request);
    }

    @Override
    public String objectifEfficacite() {
        return "L’objectif d’efficacité est de " + OBJECTIF + "% minimum.";
    }

    @Override
    public List<Efficacite> getAll() {
        return repository.findAll();
    }

    @Override
    public Efficacite getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Efficacité non trouvée avec l'id: " + id));
    }

    @Override
    public Efficacite update(Long id, Efficacite request) {
        Efficacite existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Efficacité non trouvée avec l'id: " + id));

        existing.setSemaine(request.getSemaine());
        existing.setTempsStandard(request.getTempsStandard());
        existing.setTempsAlloue(request.getTempsAlloue());

        double taux = (request.getTempsAlloue() == 0) ? 0 : (request.getTempsStandard() * 100.0) / request.getTempsAlloue();
        existing.setEfficacite(taux);

        return repository.save(existing);
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Efficacité non trouvée avec l'id: " + id);
        }
        repository.deleteById(id);
    }
}