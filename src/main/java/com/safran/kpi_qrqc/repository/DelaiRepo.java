package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.Delai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DelaiRepo extends JpaRepository<Delai, Long> {
    List<Delai> findByDate(LocalDate date);
}