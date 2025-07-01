import { Component, OnInit } from '@angular/core';
import { Cout, CoutService } from 'src/app/services/cout.service';
import { DelaiService } from 'src/app/services/delai.service';
import { QualiteService } from 'src/app/services/qualite.service';
import * as XLSX from 'xlsx';
import { forkJoin } from 'rxjs';

interface GroupedCoutByKPI {
  kpi: string;
  items: Cout[];
}

@Component({
  selector: 'app-cout-list',
  templateUrl: './cout.component.html',
  styleUrls: ['./cout.component.css']
})
export class CoutComponent implements OnInit {
  couts: Cout[] = [];
  filteredCouts: Cout[] = [];
  groupedByKPI: GroupedCoutByKPI[] = [];

  editingRows: { [key: string]: boolean } = {};
  newRows: { [key: string]: Cout } = {};

  showDeleteConfirm = false;
  showAverageBox = false;
  dragging = false;

  loading = false;
  savingRows: { [key: string]: boolean } = {};
  loadingAverageByPiloteKPI = false;

  error = '';
  rowErrors: { [key: string]: string } = {};

  coutToDeleteId: number | null = null;

  filterStartDate = '';
  filterEndDate = '';
  filterKPI = '';
  filterPilote = '';
showDowntimeModal = false;
downtimeLine = {
  kpi: '',
  pilote: '',
  dateDebut: '',
  dateFin: '',
  heuresStandardsDeclarees: -1,
  heuresPresenceBadgees: -1,
  objectif: 0,
};

  uniqueKPIs: string[] = [];
  uniquePilotes: string[] = [];

  averageResultByPiloteKPI: number | null = null;

  showNewKpiModal: boolean = false;
  newKpi = { kpi: '', pilote: '', objectif: 95 };

  constructor(
    private coutService: CoutService,
    private delaiService: DelaiService,
    private qualiteService: QualiteService
  ) {}

  ngOnInit(): void {
    this.loadCouts();
  }

  loadCouts(): void {
    this.loading = true;
    this.error = '';
    
    this.coutService.getAll().subscribe({
      next: (data) => {
        this.couts = data;
        this.extractUniqueValues();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
        console.error('Error loading couts:', error);
      }
    });
  }

  extractUniqueValues(): void {
    this.uniqueKPIs = Array.from(new Set(this.couts.map(c => c.kpi).filter((kpi): kpi is string => typeof kpi === 'string' && !!kpi))).sort();
    this.uniquePilotes = Array.from(new Set(this.couts.map(c => c.pilote).filter(pilote => pilote))).sort();
  }

  applyFilters(): void {
    this.filteredCouts = this.couts.filter(c => {
      const itemDate = new Date(c.date);

      if (this.filterStartDate && itemDate < new Date(this.filterStartDate)) return false;
      if (this.filterEndDate && itemDate > new Date(this.filterEndDate)) return false;
      
      if (this.filterKPI && c.kpi !== this.filterKPI) return false;
      
      if (this.filterPilote && c.pilote !== this.filterPilote) return false;

      return true;
    });

    this.groupByKPI();
    this.loadAverageByPiloteKPI();
  }

  groupByKPI(): void {
    const groups: { [key: string]: Cout[] } = {};
    
    this.filteredCouts.forEach(c => {
      const kpi = c.kpi || 'Non défini';
      if (!groups[kpi]) groups[kpi] = [];
      groups[kpi].push(c);
    });

    this.groupedByKPI = Object.keys(groups)
      .sort()
      .map(kpi => ({ 
        kpi, 
        items: groups[kpi].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));
  }

  addNewRow(kpi: string): void {
    const newRowKey = `${kpi}_new_${Date.now()}`;
    const lastItem = this.groupedByKPI.find(g => g.kpi === kpi)?.items[0];

    this.newRows[newRowKey] = {
      kpi: kpi,
      date: new Date().toISOString().split('T')[0],
      heuresStandardsDeclarees: 0,
      heuresPresenceBadgees: 0,
      objectif: lastItem?.objectif ?? 95,
      pilote: lastItem?.pilote ?? ''
    };
    this.editingRows[newRowKey] = true;
    this.rowErrors[newRowKey] = '';
  }

  openNewKpiModal() {
    this.newKpi = { kpi: '', pilote: '', objectif: 95 };
    this.showNewKpiModal = true;
  }

  cancelNewKpi() {
    this.showNewKpiModal = false;
  }

  confirmNewKpi() {
    // Check if KPI exists in Cout
    const kpiExists = this.uniqueKPIs.includes(this.newKpi.kpi);
    if (kpiExists) {
      alert('Ce KPI existe déjà.');
      return;
    }

    // Prepare new entries for all three services
    const newCoutEntry: Cout = {
      kpi: this.newKpi.kpi,
      pilote: this.newKpi.pilote,
      objectif: this.newKpi.objectif,
      date: new Date().toISOString().split('T')[0],
      heuresPresenceBadgees: 0,
      heuresStandardsDeclarees: 0
    };

    const newDelaiEntry: any = {
      kpi: this.newKpi.kpi,
      pilote: this.newKpi.pilote,
      date: new Date().toISOString().split('T')[0],
      nombrePiecesATemps: 0,
      nombrePiecesPlanifiees: 0,
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
      this.coutService.create(newCoutEntry),
      this.delaiService.create(newDelaiEntry),
      this.qualiteService.create(newQualiteEntry)
    ]).subscribe({
      next: () => {
        this.showNewKpiModal = false;
        this.loadCouts();
      },
      error: err => {
        console.error('Error adding KPI:', err);
        alert('Erreur lors de l\'ajout du KPI');
        this.loading = false;
      }
    });
  }

  saveNewRow(kpi: string, newRowKey: string): void {
    const newCout = this.newRows[newRowKey];
    
    if (!newCout.kpi || !newCout.date || !newCout.pilote) {
      this.rowErrors[newRowKey] = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.savingRows[newRowKey] = true;
    this.rowErrors[newRowKey] = '';

    this.coutService.create(newCout).subscribe({
      next: (created) => {
        this.couts.push(created);
        this.extractUniqueValues();
        this.applyFilters();
        
        delete this.newRows[newRowKey];
        delete this.editingRows[newRowKey];
        delete this.savingRows[newRowKey];
        delete this.rowErrors[newRowKey];
      },
      error: (error) => {
        this.rowErrors[newRowKey] = 'Erreur lors de l\'ajout du KPI';
        delete this.savingRows[newRowKey];
        console.error('Error adding cout:', error);
      }
    });
  }

  cancelNewRow(newRowKey: string): void {
    delete this.newRows[newRowKey];
    delete this.editingRows[newRowKey];
    delete this.rowErrors[newRowKey];
  }

  editRow(cout: Cout): void {
    if (cout.id) {
      this.editingRows[cout.id.toString()] = true;
      this.rowErrors[cout.id.toString()] = '';
    }
  }

  saveRow(cout: Cout): void {
    if (!cout.id) return;

    const rowKey = cout.id.toString();
    this.savingRows[rowKey] = true;
    this.rowErrors[rowKey] = '';

    this.coutService.update(cout.id, cout).subscribe({
      next: (updated) => {
        const index = this.couts.findIndex(c => c.id === updated.id);
        if (index !== -1) {
          this.couts[index] = updated;
        }
        this.extractUniqueValues();
        this.applyFilters();
        
        delete this.editingRows[rowKey];
        delete this.savingRows[rowKey];
      },
      error: (error) => {
        this.rowErrors[rowKey] = 'Erreur lors de la mise à jour du KPI';
        delete this.savingRows[rowKey];
        console.error('Error updating cout:', error);
      }
    });
  }

  cancelEdit(cout: Cout): void {
    if (cout.id) {
      delete this.editingRows[cout.id.toString()];
      delete this.rowErrors[cout.id.toString()];
      this.loadCouts();
    }
  }

  deleteQualiteRequest(id: number | undefined): void {
    if (!id) {
      console.error('Cannot delete: ID is undefined');
      alert('Erreur: ID non défini');
      return;
    }
    this.coutToDeleteId = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    console.log('Confirming delete for ID:', this.coutToDeleteId);
    
    if (this.coutToDeleteId !== null) {
      this.coutService.delete(this.coutToDeleteId).subscribe({
        next: () => {
          console.log('Delete successful');
          this.couts = this.couts.filter(c => c.id !== this.coutToDeleteId);
          this.extractUniqueValues();
          this.applyFilters();
          this.cancelDelete();
        },
        error: (error) => {
          console.error('Error deleting cout:', error);
          alert('Erreur lors de la suppression');
          this.cancelDelete();
        }
      });
    }
  }

  cancelDelete(): void {
    this.coutToDeleteId = null;
    this.showDeleteConfirm = false;
  }

  clearFilters(): void {
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.filterKPI = '';
    this.filterPilote = '';
    this.applyFilters();
  }

  loadAverageByPiloteKPI(): void {
    if (!this.filterKPI || !this.filterPilote) {
      this.averageResultByPiloteKPI = null;
      this.showAverageBox = false;
      return;
    }

    this.loadingAverageByPiloteKPI = true;
    this.showAverageBox = true;

    const filteredByPiloteKPI = this.filteredCouts.filter(c => 
      c.kpi === this.filterKPI && c.pilote === this.filterPilote
    );

    if (filteredByPiloteKPI.length > 0) {
      const sum = filteredByPiloteKPI.reduce((acc, c) => acc + (c.resultat || 0), 0);
      this.averageResultByPiloteKPI = sum / filteredByPiloteKPI.length;
    } else {
      this.averageResultByPiloteKPI = 0;
    }

    this.loadingAverageByPiloteKPI = false;
  }

  exportExcel(): void {
    if (this.filteredCouts.length === 0) {
      alert('Aucune donnée à exporter');
      return;
    }

    const data = this.filteredCouts.map(c => ({
      KPI: c.kpi,
      Date: new Date(c.date).toLocaleDateString('fr-FR'),
      'Heures Standards Déclarées': c.heuresStandardsDeclarees,
      'Heures Présence Badgées': c.heuresPresenceBadgees,
      'Résultat (%)': (c.resultat || 0).toFixed(2),
      'Objectif (%)': c.objectif?.toFixed(2) || '0.00',
      Pilote: c.pilote
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cout KPIs');
    
    const filename = `Cout_KPIs_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, filename);
  }

  getNewRowKeys(kpi: string): string[] {
    return Object.keys(this.newRows).filter(key => key.startsWith(`${kpi}_new_`));
  }

  isEditing(cout: Cout): boolean {
    return cout.id ? this.editingRows[cout.id.toString()] || false : false;
  }

  isSaving(cout: Cout): boolean {
    return cout.id ? this.savingRows[cout.id.toString()] || false : false;
  }

  getRowError(cout: Cout): string {
    return cout.id ? this.rowErrors[cout.id.toString()] || '' : '';
  }
  openDowntimeModal(kpi: string): void {
  this.downtimeLine = {
    kpi: kpi,
    pilote: '',
    dateDebut: '',
    dateFin: '',
    heuresStandardsDeclarees: -1,
    heuresPresenceBadgees: -1,
    objectif: 0,
  };
  this.showDowntimeModal = true;
}

cancelDowntimeModal(): void {
  this.showDowntimeModal = false;
}

confirmDowntimeModal(): void {
  // Validate dates and pilote
  if (!this.downtimeLine.dateDebut || !this.downtimeLine.dateFin) {
    alert('Veuillez remplir tous les champs obligatoires.');
    return;
  }
  if (new Date(this.downtimeLine.dateFin) < new Date(this.downtimeLine.dateDebut)) {
    alert('La date de fin doit être supérieure ou égale à la date de début.');
    return;
  }

  // Save downtime line in coutService
  // Use dateDebut as main date in the record, store dateFin in pilote text or ignore it depending on backend
  const newDowntimeEntry: Cout = {
    kpi: this.downtimeLine.kpi,
    pilote: this.downtimeLine.pilote + ` (Ligne d'arrêt du ${this.downtimeLine.dateDebut} au ${this.downtimeLine.dateFin})`,
    date: this.downtimeLine.dateDebut,
    heuresStandardsDeclarees: -1,
    heuresPresenceBadgees: -1,
    objectif: 0,
  };

  this.loading = true;
  this.coutService.create(newDowntimeEntry).subscribe({
    next: () => {
      this.showDowntimeModal = false;
      this.loadCouts();
    },
    error: (error) => {
      alert('Erreur lors de l\'ajout de la ligne d\'arrêt');
      console.error(error);
      this.loading = false;
    }
  });
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

  const downtimeEntry: Cout = {
    kpi,
    pilote: `Ligne d'arrêt du ${startDate} au ${endDate}`,
    date: startDate,
    heuresStandardsDeclarees: -1,
    heuresPresenceBadgees: -1,
    objectif: 0,
  };

  this.loading = true;
  this.coutService.create(downtimeEntry).subscribe({
    next: () => {
      this.selectedDowntimeKPI = null;
      this.loadCouts();
    },
    error: (err) => {
      console.error('Erreur ajout ligne d’arrêt:', err);
      this.loading = false;
    }
  });
}


}