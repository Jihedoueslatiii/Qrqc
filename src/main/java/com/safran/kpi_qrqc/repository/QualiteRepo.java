package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.Qualite;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.yaml.snakeyaml.events.Event;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QualiteRepo extends JpaRepository<Qualite, Long> {
    List<Qualite> findByDate(LocalDate date);
    List<Qualite> findByPiloteAndKPI(String pilote, String KPI);
  }