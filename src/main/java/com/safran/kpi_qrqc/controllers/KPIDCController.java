package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.entities.KPI_DC;
import com.safran.kpi_qrqc.repository.KPI_DC_Repo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
public class KPIDCController implements com.safran.kpi_qrqc.controllers.KPI_DCApi {

    @Autowired
    private KPI_DC_Repo repository;

    @Override
    public List<KPI_DC> getAllKPIs() {
        return repository.findAll();
    }

    @Override
    public Optional<KPI_DC> getKPIById(Long id) {
        return repository.findById(id);
    }

    @Override
    public KPI_DC createKPI(KPI_DC kpi) {
        return repository.save(kpi);
    }

    @Override
    public KPI_DC updateKPI(Long id, KPI_DC kpi) {
        kpi.setId(id);
        return repository.save(kpi);
    }

    @Override
    public void deleteKPI(Long id) {
        repository.deleteById(id);
    }
}