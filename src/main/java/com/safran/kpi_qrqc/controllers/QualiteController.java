package com.safran.kpi_qrqc.controllers;

import com.safran.kpi_qrqc.Interfaces.QualiteApi;
import com.safran.kpi_qrqc.entities.Qualite;
import com.safran.kpi_qrqc.entities.ResultatQuotidien;
import com.safran.kpi_qrqc.repository.QualiteRepo;
import com.safran.kpi_qrqc.repository.ResultatQuotidienRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
public class QualiteController implements QualiteApi {

    @Autowired
    private QualiteRepo repository;
    @Autowired
    private ResultatQuotidienRepo resultatQuotidienRepo;

    @Override
    public List<Qualite> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Qualite> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Qualite create(Qualite qualite) {
        qualite.setResultat(0.0); // Ignorer toute tentative de saisie manuelle
        return repository.save(qualite);
    }

    @Override
    public Qualite update(Long id, Qualite qualite) {
        qualite.setId(id);
        qualite.setResultat(0.0); // Ignorer toute tentative de saisie manuelle
        return repository.save(qualite);
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public List<Qualite> getByDate(LocalDate date) {
        return repository.findByDate(date);
    }

    @Override
    public String compareResultatToObjectif(Long id) {
        Qualite qualite = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Qualité non trouvée pour l'ID : " + id));
        return qualite.getResultat() >= qualite.getObjectif() ? "Objectif atteint" : "Objectif non atteint";
    }
    @Override
    public double getAverageResultat() {
        List<Qualite> allQualite = repository.findAll();
        if (allQualite.isEmpty()) {
            return 0.0;
        }
        return allQualite.stream()
                .mapToDouble(Qualite::getResultat)
                .average()
                .orElse(0.0);
    }
//    @Override
//    public ResultatQuotidien addResultat(Long id, ResultatQuotidien resultatQuotidien) {
//        Qualite qualite = qualiteRepo.findById(id)
//                .orElseThrow(() -> new RuntimeException("Qualité non trouvée pour l'ID : " + id));
//        resultatQuotidien.setQualite(qualite);
//        resultatQuotidien.setResultat(0.0); // Ignorer saisie manuelle
//        return resultatQuotidienRepo.save(resultatQuotidien);
//    }
//    @Override
//    public List<ResultatQuotidien> getResultats(Long id) {
//        return resultatQuotidienRepo.findByQualiteId(id);
//    }

    @Override
    public double getAverageResultatById(Long id) {
        List<ResultatQuotidien> resultats = resultatQuotidienRepo.findByQualiteId(id);
        if (resultats.isEmpty()) {
            return 0.0;
        }
        return resultats.stream()
                .mapToDouble(ResultatQuotidien::getResultat)
                .average()
                .orElse(0.0);
    }

//    @Override
//    public ResultatQuotidien addResultat(Long id, ResultatQuotidien resultatQuotidien) {
//        Qualite qualite = repository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Qualité non trouvée pour l'ID : " + id));
//        resultatQuotidien.setQualite(qualite);
//        resultatQuotidien.setResultat(0.0); // Ignore manual input
//        return resultatQuotidienRepo.save(resultatQuotidien);
//    }

//    @Override
//    public List<ResultatQuotidien> getResultats(Long id) {
//        return resultatQuotidienRepo.findByQualiteId(id);
//    }
@Override
public double getAverageResultatByPiloteAndKPI(String pilote, String kpi) {
    List<Qualite> qualites = repository.findByPiloteAndKPI(pilote, kpi);
    if (qualites.isEmpty()) {
        return 0.0;
    }
    return qualites.stream()
            .mapToDouble(Qualite::getResultat)
            .average()
            .orElse(0.0);
}


}
