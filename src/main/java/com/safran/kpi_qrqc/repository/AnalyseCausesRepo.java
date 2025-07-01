package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.AnalyseCauses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyseCausesRepo extends JpaRepository<AnalyseCauses, Long> {
    List<AnalyseCauses> findBySemaine(int semaine);
    List<AnalyseCauses> findByIndicateur(String indicateur);
}
