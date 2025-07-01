package com.safran.kpi_qrqc.repository.KPI_Projet;

import com.safran.kpi_qrqc.entities.KPI_Projet.Efficacite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EfficaciteRepository extends JpaRepository<Efficacite, Long> {

}
