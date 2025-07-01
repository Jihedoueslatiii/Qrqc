    package com.safran.kpi_qrqc.Interfaces.KPI_Projet;

    import com.safran.kpi_qrqc.entities.KPI_Projet.Efficacite;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RequestMapping("/efficacite")
    @CrossOrigin(origins = "*")
    public interface EfficaciteApi {

        @PostMapping("/calcul")
        Efficacite calculerEfficacite(@RequestBody Efficacite request);

        @GetMapping("/objectif")
        String objectifEfficacite();

        @GetMapping("/")
        List<Efficacite> getAll();

        @GetMapping("/{id}")
        Efficacite getById(@PathVariable Long id);

        @PutMapping("/{id}")
        Efficacite update(@PathVariable Long id, @RequestBody Efficacite request);

        @DeleteMapping("/{id}")
        void delete(@PathVariable Long id);
    }
