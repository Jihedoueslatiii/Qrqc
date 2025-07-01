package com.safran.kpi_qrqc.entities.KPI_Projet;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class HseTagWeeklyKpi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name = "HSE TAG FY25"; // Fixed name for this KPI
    private String pilot; // Dynamic pilot, e.g., "Faouzi"

    @ElementCollection
    @MapKeyColumn(name = "week_string")
    @Column(name = "weekly_count")
    private Map<String, Integer> weeklyTags = new HashMap<>(); // String keys (e.g., "01-2025")

    @ElementCollection
    @MapKeyJoinColumn(name = "week_date")
    @Column(name = "cumulative_count")
    private Map<LocalDate, Integer> cumulativeTags = new HashMap<>(); // Converted to LocalDate

    @ElementCollection
    @MapKeyJoinColumn(name = "week_date")
    @Column(name = "weekly_objective")
    private Map<LocalDate, Integer> weeklyObjectives = new HashMap<>();

    @ElementCollection
    @MapKeyJoinColumn(name = "week_date")
    @Column(name = "cumulative_objective")
    private Map<LocalDate, Integer> cumulativeObjectives = new HashMap<>();
}