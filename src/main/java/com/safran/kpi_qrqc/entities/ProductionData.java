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
public class ProductionData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String line; // e.g., "ARI21", "A32X1LR"
    private LocalDate date;
    private int ncPieces; // Number of non-conforming pieces
    private int totalPieces; // Total pieces controlled
}