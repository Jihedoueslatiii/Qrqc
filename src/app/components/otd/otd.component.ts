import { Component, OnInit } from '@angular/core';
import { OtdService, OTD } from '../../services/otd.service';

@Component({
  selector: 'app-otd',
  templateUrl: './otd.component.html',
  styleUrls: ['./otd.component.css']
})
export class OtdComponent implements OnInit {
  otds: OTD[] = [];
  attributes = ['Semaine', 'Réalisés', 'Backlog', 'Taux (%)'];
  newOtd: OTD = { semaine: '', realises: 0, backlog: 0, tauxRealisation: 0 };

  constructor(private otdService: OtdService) {}
kpiTitle: string = "KPI Délai = OTD (Souha( Kais Back up)";
  editingTitle: boolean = false;

  // Called when user saves title edit
  saveTitle() {
    this.editingTitle = false;
    // Optionally: persist title to backend here
  }

  // Called when user clicks edit button/icon
  editTitle() {
    this.editingTitle = true;
  }
  ngOnInit(): void {
    this.loadOTDs();
  }

  loadOTDs() {
    this.otdService.getAll().subscribe(data => {
      this.otds = data;
    });
  }

  addNewColumn() {
    this.otds.push({ ...this.newOtd });
  }

  updateOTD(otd: OTD) {
    if (otd.id) {
      this.otdService.update(otd.id, otd).subscribe(() => this.loadOTDs());
    } else {
      this.otdService.create(otd).subscribe(() => this.loadOTDs());
    }
  }

  deleteOTD(otd: OTD) {
    if (otd.id && confirm(`Delete OTD for semaine ${otd.semaine}?`)) {
      this.otdService.delete(otd.id).subscribe(() => this.loadOTDs());
    }
  }

 currentPage = 0;
  columnsPerPage = 4;

  // Computed property: total pages
  get totalPages(): number {
    return Math.ceil(this.otds.length / this.columnsPerPage) || 1;
  }

  // Computed property: otds of current page
  get pagedOTDs(): OTD[] {
    const start = this.currentPage * this.columnsPerPage;
    return this.otds.slice(start, start + this.columnsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }
}
