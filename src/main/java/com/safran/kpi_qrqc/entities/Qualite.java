package com.safran.kpi_qrqc.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Qualite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String KPI ;

    private LocalDate date;

    private int nombrePiecesNc;

    private int nombrePiecesTotal;

    private double resultat;

    private double objectif;

    private String pilote;
//    @OneToMany(mappedBy = "qualite", cascade = CascadeType.ALL, orphanRemoval = true)
//    private List<ResultatQuotidien> resultatsQuotidiens = new ArrayList<>();

    @PrePersist
    @PreUpdate
    private void calculateResultat() {
        if (nombrePiecesTotal > 0) {
            this.resultat = ((double) (nombrePiecesTotal - nombrePiecesNc) / nombrePiecesTotal) * 100;
        } else {
            this.resultat = 0.0;
        }
    }
}