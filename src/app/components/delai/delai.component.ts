import { Component, OnInit } from '@angular/core';
import { Delai } from 'src/app/models/Delai';
import { DelaiService } from 'src/app/services/delai.service';
import { CoutService } from 'src/app/services/cout.service';
import { QualiteService } from 'src/app/services/qualite.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-delai',
  templateUrl: './delai.component.html',
  styleUrls: ['./delai.component.css']
})
export class DelaiComponent implements OnInit {
  delais: Delai[] = [];
  filteredDelais: Delai[] = [];
  loading = false;

  averageFilteredResult: number | null = null;
  showAverageBox: boolean = true;
  dragging: boolean = false;

  uniqueKpis: string[] = [];
  uniquePilotes: string[] = [];

  groupedDelais: { [kpi: string]: Delai[] } = {};
  groupedKpis: string[] = [];

  filterStartDate = '';
  filterEndDate = '';
  filterKPI = '';
  filterPilote = '';

  editingRows: { [key: string]: boolean } = {};
  newRows: { [kpi: string]: Delai } = {};

  showNewKpiModal: boolean = false;
  newKpi = { kpi: '', pilote: '', objectif: 95 };

  constructor(
    private delaiService: DelaiService,
    private coutService: CoutService,
    private qualiteService: QualiteService
  ) {}

  ngOnInit(): void {
    this.loadDelais();
  }

  loadDelais(): void {
    this.loading = true;
    this.delaiService.getAll().subscribe(data => {
      this.delais = data;
      this.uniquePilotes = Array.from(new Set(data.map(d => d.pilote))).filter(Boolean);
      this.applyFilters();
      this.loading = false;
    });
  }

  groupDelaisByKPI(delais: Delai[]) {
    this.groupedDelais = {};
    const kpiSet = new Set<string>();

    delais.forEach(d => {
      if (!this.groupedDelais[d.kpi]) {
        this.groupedDelais[d.kpi] = [];
      }
      this.groupedDelais[d.kpi].push(d);
      kpiSet.add(d.kpi);
    });

    this.groupedKpis = Object.keys(this.groupedDelais);
    this.uniqueKpis = Array.from(kpiSet);
  }

  calculateFilteredAverage(): void {
    const valid = this.filteredDelais.filter(d => d.nombrePiecesPlanifiees > 0);
    if (valid.length === 0) {
      this.averageFilteredResult = null;
      return;
    }
    const total = valid.reduce((sum, d) => sum + (d.nombrePiecesATemps / d.nombrePiecesPlanifiees) * 100, 0);
    this.averageFilteredResult = total / valid.length;
  }

  applyFilters(): void {
    this.filteredDelais = this.delais.filter(d => {
      const date = new Date(d.date);
      if (this.filterStartDate && date < new Date(this.filterStartDate)) return false;
      if (this.filterEndDate && date > new Date(this.filterEndDate)) return false;
      if (this.filterKPI && d.kpi !== this.filterKPI) return false;
      if (this.filterPilote && d.pilote !== this.filterPilote) return false;
      return true;
    });

    this.groupDelaisByKPI(this.filteredDelais);
    this.calculateFilteredAverage();
  }

  clearFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterKPI = '';
    this.filterPilote = '';
    this.applyFilters();
  }

  addNewRow(kpi: string): void {
    const existingKpiData = this.groupedDelais[kpi]?.[0];
    
    this.newRows[kpi] = {
      kpi: kpi,
      date: new Date().toISOString().split('T')[0],
      nombrePiecesATemps: 0,
      nombrePiecesPlanifiees: 0,
      objectif: existingKpiData?.objectif || 95,
      pilote: existingKpiData?.pilote || ''
    };
  }

  saveNewRow(kpi: string): void {
    const newRow = this.newRows[kpi];
    if (!newRow) return;

    this.delaiService.create(newRow).subscribe({
      next: () => {
        delete this.newRows[kpi];
        this.loadDelais();
      },
      error: err => console.error('Save failed:', err)
    });
  }

  cancelNewRow(kpi: string): void {
    delete this.newRows[kpi];
  }

  startEdit(delai: Delai): void {
    if (delai.id) {
      this.editingRows[delai.id.toString()] = true;
    }
  }

  saveEdit(delai: Delai): void {
    if (!delai.id) return;

    this.delaiService.update(delai.id, delai).subscribe({
      next: () => {
        delete this.editingRows[delai.id!.toString()];
        this.loadDelais();
      },
      error: err => console.error('Update failed:', err)
    });
  }

  cancelEdit(delai: Delai): void {
    if (delai.id) {
      delete this.editingRows[delai.id.toString()];
      this.loadDelais();
    }
  }

  isEditing(delai: Delai): boolean {
    return delai.id ? this.editingRows[delai.id.toString()] || false : false;
  }

  hasNewRow(kpi: string): boolean {
    return !!this.newRows[kpi];
  }

  getNewRow(kpi: string): Delai | null {
    return this.newRows[kpi] || null;
  }

  deleteDelai(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer ce délai ?')) return;
    this.delaiService.delete(id).subscribe({
      next: () => this.loadDelais(),
      error: err => console.error('Delete failed:', err)
    });
  }

  openNewKpiModal() {
    this.newKpi = { kpi: '', pilote: '', objectif: 95 };
    this.showNewKpiModal = true;
  }

  cancelNewKpi() {
    this.showNewKpiModal = false;
  }

  confirmNewKpi() {
    // Check if KPI exists in Delai
    const kpiExists = this.uniqueKpis.includes(this.newKpi.kpi);
    if (kpiExists) {
      alert('Ce KPI existe déjà.');
      return;
    }

    // Prepare new entries for all three services
    const newDelaiEntry: Delai = {
      kpi: this.newKpi.kpi,
      pilote: this.newKpi.pilote,
      date: new Date().toISOString().split('T')[0],
      nombrePiecesATemps: 0,
      nombrePiecesPlanifiees: 0,
      objectif: this.newKpi.objectif
    };

    const newCoutEntry: any = {
      kpi: this.newKpi.kpi,
      pilote: this.newKpi.pilote,
      date: new Date().toISOString().split('T')[0],
      heuresStandardsDeclarees: 0,
      heuresPresenceBadgees: 0,
      objectif: this.newKpi.objectif
    };

    const newQualiteEntry: any = {
      kpi: this.newKpi.kpi,
      pilote: this.newKpi.pilote,
      date: new Date().toISOString().split('T')[0],
      nombrePiecesNc: 0,
      nombrePiecesTotal: 0,
      objectif: this.newKpi.objectif,
      resultat: 0
    };

    this.loading = true;
    forkJoin([
      this.delaiService.create(newDelaiEntry),
      this.coutService.create(newCoutEntry),
      this.qualiteService.create(newQualiteEntry)
    ]).subscribe({
      next: () => {
        this.showNewKpiModal = false;
        this.loadDelais();
      },
      error: err => {
        console.error('Error adding KPI:', err);
        alert('Erreur lors de l\'ajout du KPI');
        this.loading = false;
      }
    });
  }

  exportToExcel(): void {
    const exportData: any[] = [];

    this.groupedKpis.forEach(kpi => {
      exportData.push({ Kpi: kpi, Date: '', 'Nb Pièces à Temps': '', 'Nb Pièces Planifiées': '', Objectif: '', Pilote: '' });

      this.groupedDelais[kpi].forEach(delai => {
        exportData.push({
          Kpi: '',
          Date: delai.date,
          'Nb Pièces à Temps': delai.nombrePiecesATemps,
          'Nb Pièces Planifiées': delai.nombrePiecesPlanifiees,
          Objectif: delai.objectif,
          resultat: delai.nombrePiecesATemps / delai.nombrePiecesPlanifiees * 100 || 0,
          Pilote: delai.pilote
        });
      });

      exportData.push({});
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData, { skipHeader: false });
    worksheet['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 20 }
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Délai KPI': worksheet },
      SheetNames: ['Délai KPI']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    FileSaver.saveAs(blob, `Delais-KPI-${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  get groupedDelaisKeys(): string[] {
    return Object.keys(this.groupedDelais);
  }

  downtimeNotices: { [kpi: string]: { startDate: string; endDate: string } | null } = {};
  selectedDowntimeKPI: string | null = null;
  downtimeDateRange = { startDate: '', endDate: '' };

  openDowntimeForKpi(kpi: string) {
    this.selectedDowntimeKPI = kpi;
    this.downtimeDateRange = { startDate: '', endDate: '' };
  }

  cancelDowntimeForKpi() {
    this.selectedDowntimeKPI = null;
  }

confirmDowntimeForKpi() {
  const { startDate, endDate } = this.downtimeDateRange;
  const kpi = this.selectedDowntimeKPI;
  if (!startDate || !endDate || !kpi) return;

  // Store ligne d’arrêt as a special Delai entry
  const downtimeEntry: Delai = {
    kpi,
    date: startDate,
    nombrePiecesATemps: -1,
    nombrePiecesPlanifiees: -1,
    objectif: 0,
    pilote: `Ligne arrêt: ${startDate} au ${endDate}`
  };

  this.delaiService.create(downtimeEntry).subscribe({
    next: () => {
      this.selectedDowntimeKPI = null;
      this.loadDelais(); // reload with ligne d'arrêt included
    },
    error: err => {
      console.error('Erreur ajout ligne d’arrêt:', err);
    }
  });
}


  getRowsWithDowntime(kpi: string): (Delai | { isDowntime: true, startDate: string, endDate: string })[] {
    const delais = this.groupedDelais[kpi] || [];
    const downtime = this.downtimeNotices[kpi];

    const rows: (Delai | { isDowntime: true, startDate: string, endDate: string })[] = [...delais];

    if (downtime) {
      rows.push({
        isDowntime: true,
        startDate: downtime.startDate,
        endDate: downtime.endDate
      });
    }

    return rows.sort((a, b) => {
      const dateA = a.hasOwnProperty('isDowntime') ? new Date((a as any).startDate).getTime() : new Date((a as Delai).date).getTime();
      const dateB = b.hasOwnProperty('isDowntime') ? new Date((b as any).startDate).getTime() : new Date((b as Delai).date).getTime();
      return dateA - dateB;
    });
  }
}