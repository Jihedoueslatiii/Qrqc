package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.ProductionData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductionDataRepo extends JpaRepository<ProductionData, Long> {
    List<ProductionData> findByDate(LocalDate date);
    List<ProductionData> findByLineAndDate(String line, LocalDate date);
}