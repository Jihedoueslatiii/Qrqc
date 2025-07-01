package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.entities.PlanAction;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RequestMapping("/plan-actions")
@CrossOrigin(origins = "*")
public interface PlanActionApi {

    @GetMapping
    List<PlanAction> getAll();

    @GetMapping("/{id}")
    Optional<PlanAction> getById(@PathVariable Long id);

    @PostMapping
    PlanAction create(@RequestBody PlanAction planAction);

    @PutMapping("/{id}")
    PlanAction update(@PathVariable Long id, @RequestBody PlanAction planAction);

    @DeleteMapping("/{id}")
    void delete(@PathVariable Long id);
}