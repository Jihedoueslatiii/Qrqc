package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.PlanAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanActionRepo extends JpaRepository<PlanAction, Long> {
}
