package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.entities.PlanAction;
import com.safran.kpi_qrqc.repository.PlanActionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
public class PlanActionController implements com.safran.kpi_qrqc.controllers.PlanActionApi {

    @Autowired
    private PlanActionRepo repository;

    @Override
    public List<PlanAction> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<PlanAction> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public PlanAction create(PlanAction planAction) {
        return repository.save(planAction);
    }

    @Override
    public PlanAction update(Long id, PlanAction planAction) {
        planAction.setId(id);
        return repository.save(planAction);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}