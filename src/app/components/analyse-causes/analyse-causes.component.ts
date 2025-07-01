import { Component, OnInit } from '@angular/core';
import { AnalyseCausesService } from '../../services/analyse-causes.service';
import { AnalyseCauses } from '../../models/AnalyseCauses';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-analyse-causes',
  templateUrl: './analyse-causes.component.html',
  styleUrls: ['./analyse-causes.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AnalyseCausesComponent implements OnInit {
  analyseCauses: AnalyseCauses[] = [];
  loading = false;

  newAnalyse: AnalyseCauses = {
    date: '',
    semaine: 0,
    indicateur: '',
    probleme: '',
    pourquoi: '',
    planAction: {
      action: '',
      pilote: '',
      delai: '',
      statut: 'NOT_STARTED'
    }
  };

  editingAnalyse: AnalyseCauses | null = null;
  showAddModal = false;
  showEditModal = false;

  constructor(private analyseService: AnalyseCausesService) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll(): void {
    this.loading = true;
    this.analyseService.getAll().subscribe({
      next: data => {
        this.analyseCauses = data;
        this.loading = false;
      },
      error: err => {
        console.error('Erreur lors du chargement des analyses', err);
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  addAnalyse(): void {
    this.analyseService.create(this.newAnalyse).subscribe({
      next: createdAnalyse => {
        this.analyseCauses.push(createdAnalyse);
        this.resetForm();
        this.closeAddModal();
      },
      error: err => {
        console.error('Erreur lors de l\'ajout', err);
      }
    });
  }

  resetForm(): void {
    this.newAnalyse = {
      date: '',
      semaine: 0,
      indicateur: '',
      probleme: '',
      pourquoi: '',
      planAction: {
        action: '',
        pilote: '',
        delai: '',
        statut: 'NOT_STARTED'
      }
    };
  }

  trackByAnalyse(index: number, analyse: AnalyseCauses): any {
    return analyse.id || index;
  }

  // Edit modal handlers
  openEditModal(analyse: AnalyseCauses) {
    this.editingAnalyse = JSON.parse(JSON.stringify(analyse)); // deep clone
    this.showEditModal = true;
  }

  closeEditModal() {
    this.editingAnalyse = null;
    this.showEditModal = false;
  }

  updateAnalyse(): void {
    if (!this.editingAnalyse || !this.editingAnalyse.id) return;

    this.analyseService.update(this.editingAnalyse.id, this.editingAnalyse).subscribe({
      next: updatedAnalyse => {
        const index = this.analyseCauses.findIndex(a => a.id === updatedAnalyse.id);
        if (index !== -1) this.analyseCauses[index] = updatedAnalyse;
        this.closeEditModal();
      },
      error: err => {
        console.error('Erreur lors de la mise à jour', err);
      }
    });
  }

  // Delete handler
  deleteAnalyse(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette analyse ?')) return;

    this.analyseService.delete(id).subscribe({
      next: () => {
        this.analyseCauses = this.analyseCauses.filter(a => a.id !== id);
      },
      error: err => {
        console.error('Erreur lors de la suppression', err);
      }
    });
  }
}
