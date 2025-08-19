import { Component, OnInit } from '@angular/core';
import { Qualite, QualiteService } from '../services/qualite.service';
import * as XLSX from 'xlsx';

interface GroupedQualite {
  date: string; // ISO string
  items: Qualite[];
}

interface GroupedByKPI {
  kpi: string;
  items: Qualite[];
}

@Component({
  selector: 'app-qualite-list',
  templateUrl: './qualite-list.component.html',
  styleUrls: ['./qualite-list.component.css']
})
export class QualiteListComponent implements OnInit {
  qualites: Qualite[] = [];
  filteredQualites: Qualite[] = [];
  groupedByDate: GroupedQualite[] = [];
  groupedByKPI: GroupedByKPI[] = [];
  loading = false;
  error = '';

  newQualite: Qualite = {
    kpi: '',
    date: '',
    nombrePiecesNc: 0,
    nombrePiecesTotal: 0,
    resultat: 0,
    objectif: 0,
    pilote: ''
  };

  adding = false;
  addError = '';
  showAddModal = false;
  showAverageBox = true;
  dragging = false;

  averageResultat: number | null = null;
  loadingAverage = false;

  selectedQualite: Qualite | null = null;
  updateError = '';
  updating = false;

  comparisonResult: string = '';
  averageResultById: number | null = null;
  averageResultByPiloteKPI: number | null = null;
  loadingAverageByPiloteKPI = false;

  filterStartDate: string = '';
  filterEndDate: string = '';
  filterKPI: string = '';
  filterPilote: string = '';

  uniqueKPIs: string[] = [];
  uniquePilotes: string[] = [];

  showDeleteConfirm: boolean = false;
  qualiteToDeleteId: number | null = null;

  selectedKPIForAverage: string = '';
  averageResultByKPI: number | null = null;
  loadingAverageByKPI = false;

  constructor(private qualiteService: QualiteService) {}

  ngOnInit(): void {
    this.loadQualites();
  }

  loadQualites(): void {
    this.loading = true;
    this.qualiteService.getAll().subscribe({
      next: (data) => {
        this.qualites = data;
        this.uniqueKPIs = Array.from(new Set(this.qualites.map(q => q.kpi))).sort();
        this.uniquePilotes = Array.from(new Set(this.qualites.map(q => q.pilote))).sort();
        this.filteredQualites = [...this.qualites];
        this.groupedByDate = this.groupByDate(this.filteredQualites);
        this.groupedByKPI = this.groupByKPI(this.filteredQualites);

        if (this.uniqueKPIs.length > 0 && !this.selectedKPIForAverage) {
          this.selectedKPIForAverage = this.uniqueKPIs[0];
          this.loadAverageResultByKPI();
        }

        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des données.';
        this.loading = false;
      }
    });
  }

  getWeeklyViewByKPI(kpi: string): { day: string, data: Qualite | null }[] {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const dataForKPI = this.filteredQualites.filter(q => q.kpi === kpi);

    return weekDays.map(day => {
      const match = dataForKPI.find(q => {
        const qDate = new Date(q.date);
        const qDay = qDate.toLocaleDateString('en-US', { weekday: 'long' });
        return qDay === day;
      });
      return { day, data: match || null };
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  applyFilters(): void {
    this.filteredQualites = this.qualites.filter(q => {
      const itemDate = new Date(q.date);

      if (this.filterStartDate) {
        const start = new Date(this.filterStartDate);
        if (itemDate < start) return false;
      }
      if (this.filterEndDate) {
        const end = new Date(this.filterEndDate);
        if (itemDate > end) return false;
      }
      if (this.filterKPI && q.kpi !== this.filterKPI) {
        return false;
      }
      if (this.filterPilote && q.pilote !== this.filterPilote) {
        return false;
      }
      return true;
    });

    this.groupedByDate = this.groupByDate(this.filteredQualites);
    this.groupedByKPI = this.groupByKPI(this.filteredQualites);

    if (this.filterKPI && this.filterPilote) {
      this.loadAverageResultatByPiloteKPI(this.filterPilote, this.filterKPI);
    } else {
      this.averageResultByPiloteKPI = null;
    }
  }

  clearFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterKPI = '';
    this.filterPilote = '';
    this.applyFilters();
  }

  private groupByDate(data: Qualite[]): GroupedQualite[] {
    const groups: { [key: string]: Qualite[] } = {};
    data.forEach(item => {
      const dateStr = item.date;
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({ date, items: groups[date] }));
  }

  private groupByKPI(data: Qualite[]): GroupedByKPI[] {
    const groups: { [key: string]: Qualite[] } = {};
    data.forEach(item => {
      if (!groups[item.kpi]) {
        groups[item.kpi] = [];
      }
      groups[item.kpi].push(item);
    });
    return Object.keys(groups)
      .sort()
      .map(kpi => ({ kpi, items: groups[kpi] }));
  }

  addQualite(): void {
    this.adding = true;
    this.addError = '';

    this.qualiteService.create(this.newQualite).subscribe({
      next: (created) => {
        this.qualites.push(created);
        this.applyFilters();
        this.newQualite = {
          kpi: '',
          date: '',
          nombrePiecesNc: 0,
          nombrePiecesTotal: 0,
          resultat: 0,
          objectif: 95,
          pilote: ''
        };
        this.adding = false;
        this.showAddModal = false;
      },
      error: () => {
        this.addError = 'Erreur lors de l\'ajout du KPI.';
        this.adding = false;
      }
    });
  }

  selectForUpdate(qualite: Qualite) {
    this.selectedQualite = { ...qualite };
    this.updateError = '';
  }

  updateQualite() {
    if (!this.selectedQualite || !this.selectedQualite.id) return;

    this.updating = true;
    this.updateError = '';

    this.qualiteService.update(this.selectedQualite.id, this.selectedQualite).subscribe({
      next: (updated) => {
        const index = this.qualites.findIndex(q => q.id === updated.id);
        if (index !== -1) this.qualites[index] = updated;
        this.applyFilters();
        this.selectedQualite = null;
        this.updating = false;
      },
      error: () => {
        this.updateError = 'Erreur lors de la mise à jour.';
        this.updating = false;
      }
    });
  }

  isExistingKPI(kpi: string): boolean {
    return this.uniqueKPIs.includes(kpi);
  }

  onKpiSelect(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedKPI = target.value;
    this.newQualite.kpi = selectedKPI;

    if (this.isExistingKPI(selectedKPI)) {
      const existing = this.qualites.find(q => q.kpi === selectedKPI);
      this.newQualite.pilote = existing ? existing.pilote : '';
    } else {
      this.newQualite.pilote = '';
    }

    // Fix objectif à 95%
    this.newQualite.objectif = 95;
  }

  getPiloteByKPI(kpi: string): string | null {
    const found = this.qualites.find(q => q.kpi === kpi);
    return found ? found.pilote : null;
  }

  deleteQualite(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer ce KPI ?')) return;

    this.qualiteService.delete(id).subscribe({
      next: () => {
        this.qualites = this.qualites.filter(q => q.id !== id);
        this.applyFilters();
      },
      error: () => alert('Erreur lors de la suppression.')
    });
  }

  cancelUpdate() {
    this.selectedQualite = null;
    this.updateError = '';
  }

  deleteQualiteRequest(id: number) {
    this.qualiteToDeleteId = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete() {
    if (this.qualiteToDeleteId !== null) {
      this.deleteQualite(this.qualiteToDeleteId);
    }
    this.closeDeleteModal();
  }

  cancelDelete() {
    this.closeDeleteModal();
  }

  private closeDeleteModal() {
    this.showDeleteConfirm = false;
    this.qualiteToDeleteId = null;
  }

  loadAverageResultByKPI() {
    if (!this.selectedKPIForAverage) {
      this.averageResultByKPI = null;
      return;
    }
    this.loadingAverageByKPI = true;
    this.qualiteService.getAverageResultatByPiloteAndKPI('', this.selectedKPIForAverage).subscribe({
      next: (avg) => {
        this.averageResultByKPI = avg;
        this.loadingAverageByKPI = false;
      },
      error: () => {
        this.averageResultByKPI = null;
        this.loadingAverageByKPI = false;
      }
    });
  }

  loadAverageResultatByPiloteKPI(pilote: string, kpi: string): void {
    if (!pilote || !kpi) {
      this.averageResultByPiloteKPI = null;
      return;
    }

    this.loadingAverageByPiloteKPI = true;

    this.qualiteService.getAverageResultatByPiloteAndKPI(pilote, kpi).subscribe({
      next: (avg) => {
        this.averageResultByPiloteKPI = avg;
        this.loadingAverageByPiloteKPI = false;
      },
      error: () => {
        this.averageResultByPiloteKPI = null;
        this.loadingAverageByPiloteKPI = false;
      }
    });
  }

  exportExcel(): void {
    // Prepare data for export
    const exportData = this.filteredQualites.map(q => ({
      KPI: q.kpi,
      Date: new Date(q.date).toLocaleDateString('fr-FR'),
      'Pièces NC': q.nombrePiecesNc,
      'Pièces Totales': q.nombrePiecesTotal,
      Résultat: (q.resultat ?? 0).toFixed(2) + '%',
      Objectif: q.objectif.toFixed(2) + '%',
      Pilote: q.pilote
    }));

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 20 }, // KPI
      { wch: 15 }, // Date
      { wch: 12 }, // Pièces NC
      { wch: 15 }, // Pièces Totales
      { wch: 12 }, // Résultat
      { wch: 12 }, // Objectif
      { wch: 20 }  // Pilote
    ];

    // Style header row: bold white font on dark blue background
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
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

    // Style data cells: borders and vertical alignment with wrap text
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = {
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

    // Freeze the first row (header)
    ws['!freeze'] = { ySplit: 1 };

    // Create workbook and append worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Qualite Data');

    // Save to file
    const filename = `Qualite_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  addedRows: { [kpi: string]: Qualite[] } = {};

  addInlineRow(kpi: string) {
    if (!this.addedRows[kpi]) this.addedRows[kpi] = [];
    this.addedRows[kpi].push({
      kpi,
      date: '',
      nombrePiecesNc: 0,
      nombrePiecesTotal: 0,
      resultat: 0,
      objectif: this.getObjectifByKPI(kpi) || 95,
      pilote: this.getPiloteByKPI(kpi) || ''
    });
  }

  updateResultat(q: Qualite) {
    if (q.nombrePiecesTotal > 0) {
      q.resultat = (q.nombrePiecesNc / q.nombrePiecesTotal) * 100;
    } else {
      q.resultat = 0;
    }
  }

  cancelInlineRow(row: Qualite, kpi: string) {
    this.addedRows[kpi] = this.addedRows[kpi].filter(r => r !== row);
  }

  saveInlineRow(row: Qualite, kpi: string) {
    this.qualiteService.create(row).subscribe({
      next: (created) => {
        this.qualites.push(created);
        this.applyFilters();
        this.cancelInlineRow(row, kpi);
      },
      error: () => alert("Erreur lors de l'ajout")
    });
  }

  getObjectifByKPI(kpi: string): number | null {
    const q = this.qualites.find(x => x.kpi === kpi);
    return q?.objectif ?? 95;
  }

  createNewKPI(): void {
    const newKPI = prompt('Nom du nouveau KPI :');
    if (!newKPI || this.groupedByKPI.find(group => group.kpi === newKPI)) {
      alert('Nom invalide ou KPI déjà existant.');
      return;
    }

    const newPilote = prompt('Nom du pilote associé :') || 'Non défini';

    const newEntry: Qualite = {
      kpi: newKPI,
      pilote: newPilote,
      date: new Date().toISOString().slice(0, 10),
      nombrePiecesNc: 0,
      nombrePiecesTotal: 0,
      objectif: 95,
      resultat: 0
    };

    this.qualites.push(newEntry);
    this.applyFilters();
  }

  showNewKpiModal: boolean = false;
  newKpi = { kpi: '', pilote: '', objectif: null };  // default objectif 95%

  openNewKpiModal() {
    this.newKpi = { kpi: '', pilote: '' , objectif: null};
    this.showNewKpiModal = true;
  }

  cancelNewKpi() {
    this.showNewKpiModal = false;
  }

  confirmNewKpi() {
    const kpiExists = this.groupedByKPI.some(group => group.kpi === this.newKpi.kpi);
    if (kpiExists) {
      alert('Ce KPI existe déjà.');
      return;
    }

    const newEntry: Qualite = {
      kpi: this.newKpi.kpi,
      pilote: this.newKpi.pilote,
      date: new Date().toISOString().slice(0, 10),
      nombrePiecesNc: 0,
      nombrePiecesTotal: 0,
      objectif: 95,
      resultat: 0
    };

    this.qualites.push(newEntry);
    this.applyFilters();
    this.showNewKpiModal = false;
  }

  savingIds: number[] = []; // Track saving rows

  isEditing(q: any): boolean {
    return this.selectedQualite?.id === q?.id;
  }

  isSaving(q: any): boolean {
    return q?.id ? this.savingIds.includes(q.id) : false;
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
    if (!startDate || !endDate || !kpi) {
      alert('Veuillez remplir toutes les dates.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      alert('La date de fin doit être égale ou postérieure à la date de début.');
      return;
    }

    const downtimeEntry: Qualite = {
      kpi,
      pilote: `Ligne d'arrêt du ${startDate} au ${endDate}`,
      date: startDate,
      nombrePiecesNc: 0,
      nombrePiecesTotal: 0,
      resultat: 0,
      objectif: 0,
    };

    this.loading = true;
    this.qualiteService.create(downtimeEntry).subscribe({
      next: () => {
        this.selectedDowntimeKPI = null;
        this.loadQualites();
      },
      error: (err) => {
        console.error('Erreur ajout ligne d’arrêt:', err);
        this.loading = false;
      }
    });
  }

  isDowntimeRow(q: Qualite): boolean {
    return q.pilote?.startsWith("Ligne d'arrêt");
  }

  getDowntimeSummaryForKPI(kpi: string): string | null {
    const downtimeRows = this.qualites.filter(q =>
      q.kpi === kpi && q.pilote.includes('Ligne d\'arrêt')
    );

    if (downtimeRows.length === 0) return null;

    // Extract unique date ranges from pilote text, e.g. "Ligne d'arrêt du 2025-06-10 au 2025-06-15"
    const periods = downtimeRows.map(q => {
      const match = q.pilote.match(/du (\d{4}-\d{2}-\d{2}) au (\d{4}-\d{2}-\d{2})/);
      if (match) {
        return `du ${match[1]} au ${match[2]}`;
      }
      return null;
    }).filter(Boolean);

    if (periods.length === 0) return null;

    // Join multiple periods by commas
    return `⛔ Ligne d'arrêt ${periods.join(', ')}`;
  }
}