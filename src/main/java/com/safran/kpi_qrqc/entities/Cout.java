package com.safran.kpi_qrqc.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Cout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String kpi ;

    private LocalDate date;

    private int heuresStandardsDeclarees;

    private int heuresPresenceBadgees;

    private double resultat;

    private double objectif;

    private String pilote;

    @PrePersist
    @PreUpdate
    private void calculateResultat() {
        if (heuresPresenceBadgees > 0) {
            this.resultat = ((double) heuresStandardsDeclarees / heuresPresenceBadgees) * 100;
        } else {
            this.resultat = 0.0;
        }
    }
}