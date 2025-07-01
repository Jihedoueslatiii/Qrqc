package com.safran.kpi_qrqc.repository.KPI_Projet;

import com.safran.kpi_qrqc.entities.KPI_Projet.IpWeeklyKpi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IpWeeklyKpiRepo extends JpaRepository<IpWeeklyKpi, Long> {
}