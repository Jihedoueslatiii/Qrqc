package com.safran.kpi_qrqc.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.Map;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class KPI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., "Taux de NC Interne ARI21"
    private String pilot; // Dynamic pilot, e.g., "Faouzi", can be changed
    private String formula; // e.g., "NC/Total*100"
    private double target; // e.g., 5%

    @ElementCollection
    @MapKeyJoinColumn(name = "date")
    @Column(name = "result")
    private Map<LocalDate, Double> results; // Map of date to result value
}