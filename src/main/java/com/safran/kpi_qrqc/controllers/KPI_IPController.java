package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.Interfaces.KPI_IPApi;
import com.safran.kpi_qrqc.entities.KPI_IP;
import com.safran.kpi_qrqc.repository.KPI_IP_Repo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;

@RestController
public class KPI_IPController implements KPI_IPApi {

    @Autowired
    private KPI_IP_Repo repository;

    @Override
    public List<KPI_IP> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<KPI_IP> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public KPI_IP create(KPI_IP kpiIp) {
        return repository.save(kpiIp);
    }

    @Override
    public KPI_IP update(Long id, KPI_IP kpiIp) {
        kpiIp.setId(id);
        return repository.save(kpiIp);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<KPI_IP> getBySemaine(int semaine) {
        return repository.findBySemaine(semaine);
    }

    @Override
    public List<KPI_IP> getByAnnee(int annee) {
        return repository.findByAnnee(annee);
    }

    @Override
    public List<KPI_IP> getByCodeIp(String codeIp) {
        return repository.findByCodeIp(codeIp);
    }

    @Override
    public List<KPI_IP> getByHseTag(Boolean hseTag) {
        return repository.findByHseTag(hseTag);
    }
}