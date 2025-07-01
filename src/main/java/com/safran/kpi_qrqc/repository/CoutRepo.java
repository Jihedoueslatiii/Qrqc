package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.Cout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CoutRepo extends JpaRepository<Cout, Long> {
    List<Cout> findByDate(LocalDate date);
}