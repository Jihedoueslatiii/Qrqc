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
public class ResultatQuotidien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    private int nombrePiecesNc;

    private int nombrePiecesTotal;

    private double resultat;

    @ManyToOne
    @JoinColumn(name = "qualite_id")
    private Qualite qualite;

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