import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { Qualite } from 'src/app/models/Qaulite';
import { CoutService } from 'src/app/services/cout.service';
import { DelaiService } from 'src/app/services/delai.service';
import { QualiteService } from 'src/app/services/qualite.service';

interface Kpi {
  kpi: string;
  pilote: string;
  objectif: number;
}

@Component({
  selector: 'app-kpi-list',
  templateUrl: './kpi-list.component.html',
  styleUrls: ['./kpi-list.component.css']
})
export class KpiListComponent implements OnInit {
  kpis: Kpi[] = [];
  filteredKpis: Kpi[] = [];
  loading = false;
  error = '';
showAddKpiModal = false;

newKpi = {
  kpi: '',
  cout: { pilote: '', objectif: 95 },
  delai: { pilote: '', objectif: 95 },
  qualite: { pilote: '', objectif: 95 }
};


  filterKPI = '';
  filterPilote = '';

  sortField: keyof Kpi = 'kpi';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private delaiService: DelaiService,
    private coutService: CoutService,
    private qualiteService: QualiteService
  ) {}

  ngOnInit(): void {
    this.loadKpis();
  }

  loadKpis(): void {
    this.loading = true;
    this.error = '';

    forkJoin([
      this.delaiService.getAll(),
      this.coutService.getAll(),
      this.qualiteService.getAll()
    ]).subscribe({
      next: ([delais, couts, qualitesData]) => {
        // Combine KPIs from all three services
        const kpiMap = new Map<string, Kpi>();

        // Process Delai
        delais.forEach(d => {
          if (d.kpi) { // Type guard for undefined
            kpiMap.set(d.kpi, { kpi: d.kpi, pilote: d.pilote || '', objectif: d.objectif });
          }
        });

        // Process Cout
        couts.forEach(c => {
          if (c.kpi) { // Type guard for undefined
            kpiMap.set(c.kpi, { kpi: c.kpi, pilote: c.pilote || '', objectif: c.objectif });
          }
        });

        // Process Qualite
        qualitesData.forEach((q: Qualite) => {
          if (q.kpi) { // Type guard for undefined
            kpiMap.set(q.kpi, { kpi: q.kpi, pilote: q.pilote || '', objectif: q.objectif });
          }
        });

        this.kpis = Array.from(kpiMap.values()).sort((a, b) => a.kpi.localeCompare(b.kpi));
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des KPIs';
        this.loading = false;
        console.error('Error loading KPIs:', err);
      }
    });
  }

  applyFilters(): void {
    this.filteredKpis = this.kpis.filter(kpi => {
      if (this.filterKPI && !kpi.kpi.toLowerCase().includes(this.filterKPI.toLowerCase())) {
        return false;
      }
      if (this.filterPilote && !kpi.pilote.toLowerCase().includes(this.filterPilote.toLowerCase())) {
        return false;
      }
      return true;
    });

    this.sortKpis();
  }

  sortKpis(): void {
    this.filteredKpis.sort((a, b) => {
      const valueA = a[this.sortField];
      const valueB = b[this.sortField];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return this.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return this.sortDirection === 'asc'
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      }
    });
  }

  toggleSort(field: keyof Kpi): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortKpis();
  }

  clearFilters(): void {
    this.filterKPI = '';
    this.filterPilote = '';
    this.applyFilters();
  }

  exportToExcel(): void {
    if (this.filteredKpis.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const exportData = this.filteredKpis.map(kpi => ({
      KPI: kpi.kpi,
      Pilote: kpi.pilote,
      Objectif: kpi.objectif.toFixed(2) + '%'
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    worksheet['!cols'] = [
      { wch: 20 }, // KPI
      { wch: 20 }, // Pilote
      { wch: 15 }  // Objectif
    ];

    // Style header row
    const range = XLSX.utils.decode_range(worksheet['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 12 },
          fill: { fgColor: { rgb: 'FF1F497D' } },
          alignment: { horizontal: 'center', vertical: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: 'FF000000' } },
            bottom: { style: 'thin', color: { rgb: 'FF000000' } },
            left: { style: 'thin', color: { rgb: 'FF000000' } },
            right: { style: 'thin', color: { rgb: 'FF000000' } }
          }
        };
      }
    }

    // Style data cells
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].s = {
            alignment: { vertical: 'top', wrapText: true },
            border: {
              top: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
              bottom: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
              left: { style: 'thin', color: { rgb: 'FFCCCCCC' } },
              right: { style: 'thin', color: { rgb: 'FFCCCCCC' } }
            }
          };
        }
      }
    }

    worksheet['!freeze'] = { ySplit: 1 };

    const workbook: XLSX.WorkBook = {
      Sheets: { 'KPI List': worksheet },
      SheetNames: ['KPI List']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    FileSaver.saveAs(blob, `KPI_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
addNewKpi() {
  const { kpi, cout, delai, qualite } = this.newKpi;

  if (!kpi.trim()) {
    alert('Veuillez renseigner le nom du KPI');
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  const newCout = {
    kpi,
    pilote: cout.pilote,
    objectif: cout.objectif,
    date: today,
    heuresPresenceBadgees: 0,
    heuresStandardsDeclarees: 0
  };

  const newDelai = {
    kpi,
    pilote: delai.pilote,
    objectif: delai.objectif,
    date: today,
    nombrePiecesATemps: 0,
    nombrePiecesPlanifiees: 0
  };

  const newQualite = {
    kpi,
    pilote: qualite.pilote,
    objectif: qualite.objectif,
    date: today,
    nombrePiecesNc: 0,
    nombrePiecesTotal: 0,
    resultat: 0
  };

  this.loading = true;

  forkJoin([
    this.coutService.create(newCout),
    this.delaiService.create(newDelai),
    this.qualiteService.create(newQualite)
  ]).subscribe({
    next: () => {
      this.showAddKpiModal = false;
      this.newKpi = {
        kpi: '',
        cout: { pilote: '', objectif: 95 },
        delai: { pilote: '', objectif: 95 },
        qualite: { pilote: '', objectif: 95 }
      };
      this.loadKpis();
    },
    error: (err) => {
      console.error('Erreur ajout KPI:', err);
      alert("Erreur lors de l'ajout du KPI");
      this.loading = false;
    }
  });
}


}