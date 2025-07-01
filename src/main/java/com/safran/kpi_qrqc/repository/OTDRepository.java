package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.KPI_Projet.OTD;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OTDRepository extends JpaRepository<OTD, Long> {
}
