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
    public class AnalyseCauses {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private LocalDate date;

        private int semaine;

        private String indicateur;

        private String probleme;

        @Column(length = 1000)
        private String pourquoi;  // peut être


        @OneToOne(cascade = CascadeType.ALL)
        @JoinColumn(name = "plan_action_id", referencedColumnName = "id")
        private PlanAction planAction;
    }
