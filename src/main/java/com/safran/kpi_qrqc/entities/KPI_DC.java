package com.safran.kpi_qrqc.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
@Entity
@Getter
@Setter
@ToString

@AllArgsConstructor
@NoArgsConstructor

public class KPI_DC {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long number;

    private String projet;
    private String tache;
    private String assigneeA;
    @Temporal(TemporalType.DATE)

    private LocalDate debut;
    @Temporal(TemporalType.DATE)

    private LocalDate echeance;
    @Enumerated(EnumType.STRING)
    private StatutF statut;

    @Enumerated(EnumType.STRING)
    private BacklogStatus backlog;
    private String replanifie;
    private String indexTache;

    private int semaine;
    private int annee;
    private String semaineAnnee;

}
