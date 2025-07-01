package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.KPI;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface KPIRepo extends JpaRepository<KPI, Long> {
}