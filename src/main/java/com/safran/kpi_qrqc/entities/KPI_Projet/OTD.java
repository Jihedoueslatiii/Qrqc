package com.safran.kpi_qrqc.entities.KPI_Projet;

import jakarta.persistence.*;
import lombok.*;
import org.apache.tomcat.util.bcel.classfile.Constant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

public class OTD {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String semaine;  // Exemple : "02-2025"

    private int realises;
    private int backlog;
    public  final int objectif= 95;
    private Double tauxRealisation; // null au départ dans la requête

}
