package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.BacklogStatus;
import com.safran.kpi_qrqc.entities.KPI_DC;
import com.safran.kpi_qrqc.entities.StatutF;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository

public interface KPI_DC_Repo extends JpaRepository<KPI_DC, Long> {

}
