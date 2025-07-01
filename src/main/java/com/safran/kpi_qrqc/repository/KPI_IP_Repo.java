package com.safran.kpi_qrqc.repository;

import com.safran.kpi_qrqc.entities.KPI_IP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KPI_IP_Repo extends JpaRepository<KPI_IP, Long> {
    List<KPI_IP> findBySemaine(int semaine);
    List<KPI_IP> findByAnnee(int annee);
    List<KPI_IP> findByCodeIp(String codeIp);
    List<KPI_IP> findByHseTag(Boolean hseTag);
}
