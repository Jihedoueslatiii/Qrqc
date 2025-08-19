import { Component, OnInit } from '@angular/core';
import { AnalyseCausesService } from '../../services/analyse-causes.service';
import { AnalyseCauses } from '../../models/AnalyseCauses';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

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
  displayedColumns: string[] = [
    'date',
    'semaine',
    'indicateur',
    'probleme',
    'pourquoi',
    'action',
    'pilote',
    'delai',
    'statut',
    'actions'
  ];

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
    },
    programme: undefined
  };

  editingRowIndex: number | null = null;
  formGroups: FormGroup[] = [];
  showAddModal = false;

  constructor(
    private analyseService: AnalyseCausesService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.fetchAll();
  }

  // Fetch all analyses and initialize form groups
  fetchAll(): void {
    this.loading = true;
    this.analyseService.getAll().subscribe({
      next: data => {
        this.analyseCauses = data;
        this.initializeFormGroups();
        this.loading = false;
      },
      error: err => {
        console.error('Erreur lors du chargement des analyses', err);
        this.loading = false;
      }
    });
  }

  // Initialize form groups for each row
  initializeFormGroups(): void {
    this.formGroups = this.analyseCauses.map(analyse =>
      this.fb.group({
        date: [analyse.date, Validators.required],
        semaine: [analyse.semaine, [Validators.required, Validators.min(0)]],
        indicateur: [analyse.indicateur, Validators.required],
        probleme: [analyse.probleme, Validators.required],
        pourquoi: [analyse.pourquoi, Validators.required],
        action: [analyse.planAction?.action || '', Validators.required],
        pilote: [analyse.planAction?.pilote || ''],
        delai: [analyse.planAction?.delai || '', Validators.required],
        statut: [analyse.planAction?.statut || 'NOT_STARTED', Validators.required]
      })
    );
  }

  // Get form group for a specific row
  getFormGroup(index: number): FormGroup {
    return this.formGroups[index];
  }

  // Start editing a row
  startEditing(index: number, analyse: AnalyseCauses): void {
    this.editingRowIndex = index;
  }

  // Save edited row
  saveRow(index: number): void {
    if (this.editingRowIndex === null || !this.formGroups[index].valid) return;

    const updatedAnalyse: AnalyseCauses = {
      ...this.analyseCauses[index],
      ...this.formGroups[index].value,
      planAction: {
        action: this.formGroups[index].value.action,
        pilote: this.formGroups[index].value.pilote,
        delai: this.formGroups[index].value.delai,
        statut: this.formGroups[index].value.statut
      }
    };

    if (!updatedAnalyse.id) return;

    this.analyseService.update(updatedAnalyse.id, updatedAnalyse).subscribe({
      next: updatedAnalyse => {
        this.analyseCauses[index] = updatedAnalyse;
        this.editingRowIndex = null;
      },
      error: err => {
        console.error('Erreur lors de la mise à jour', err);
      }
    });
  }

  // Cancel editing
  cancelEditing(): void {
    this.editingRowIndex = null;
    this.initializeFormGroups(); // Reset form groups to current data
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
        this.initializeFormGroups();
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
      },
      programme: undefined
    };
  }

  trackByAnalyse(index: number, analyse: AnalyseCauses): any {
    return analyse.id || index;
  }

  deleteAnalyse(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer cette analyse ?')) return;

    this.analyseService.delete(id).subscribe({
      next: () => {
        this.analyseCauses = this.analyseCauses.filter(a => a.id !== id);
        this.initializeFormGroups();
      },
      error: err => {
        console.error('Erreur lors de la suppression', err);
      }
    });
  }
}