package com.safran.kpi_qrqc.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class KPI_IP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String titre ;

    private String codeIp;

    private int semaine;
    private int annee;
    private String semaineAnnee;


    private Boolean hseTag; // HSE Tag ? (oui/non représenté par true/false)


    private String emetteur;
}
