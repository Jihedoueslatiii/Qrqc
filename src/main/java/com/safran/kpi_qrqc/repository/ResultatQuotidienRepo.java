package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.ResultatQuotidien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultatQuotidienRepo extends JpaRepository<ResultatQuotidien, Long> {
    List<ResultatQuotidien> findByQualiteId(Long qualiteId);
}