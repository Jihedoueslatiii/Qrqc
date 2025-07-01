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
public class Delai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String kpi ;

    private LocalDate date;

    private int nombrePiecesATemps;

    private int nombrePiecesPlanifiees;

    private double resultat;

    private double objectif;

    private String pilote;

    @PrePersist
    @PreUpdate
    private void calculateResultat() {
        if (nombrePiecesPlanifiees > 0) {
            this.resultat = ((double) nombrePiecesATemps / nombrePiecesPlanifiees) * 100;
        } else {
            this.resultat = 0.0;
        }
    }
}
