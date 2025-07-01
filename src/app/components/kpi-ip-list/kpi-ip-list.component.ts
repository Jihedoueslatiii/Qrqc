// src/app/components/kpi-ip-list/kpi-ip-list.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KpiIpService } from '../../services/kpi-ip.service'; // Adjust the path
import { KPI_IP } from '../../models/KPI_IP';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-kpi-ip-list',
  templateUrl: './kpi-ip-list.component.html',
  styleUrls: ['./kpi-ip-list.component.css']
})
export class KpiIpListComponent implements OnInit {
  data: KPI_IP[] = [];
  showAddForm: boolean = false;
  kpiForm: FormGroup;
  editMode: boolean = false;
editedItemId: number | null = null;
showDeleteConfirm: boolean = false;
itemToDelete: KPI_IP | null = null;
  filteredData: KPI_IP[] = [];   // filtered data for display
  searchQuery: string = '';
  uniqueSemaineAnnees: string[] = [];
  selectedSemaineAnnee: string = '';








  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private kpiIpService: KpiIpService,
    private toastr: ToastrService

  ) {
    this.kpiForm = this.fb.group({
      titre: ['', Validators.required],
     
      codeIp: ['', Validators.required],
      semaine: [null, [Validators.required, Validators.min(1), Validators.max(52)]],
      annee: [2025, Validators.required],
semaineAnnee: ['']  , // NOT disabled
      hseTag: [false],
      emetteur: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.http.get<KPI_IP[]>('http://localhost:8089/kpi-ip')
      .subscribe({
        next: (response) => {
          this.data = response.map((item, index) => ({ ...item, order: index }));
                  this.filteredData = [...this.data]; // Ensure all are shown by default
                    const all = this.data.map(item => item.semaineAnnee);
      this.uniqueSemaineAnnees = Array.from(new Set(all)).sort();

        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }


  editItem(item: KPI_IP) {
  this.editMode = true;
  this.editedItemId = item.id!;
  this.kpiForm.patchValue(item);
  this.updateSemaineAnnee();
  this.showAddForm = true;
}


  deleteItem(item: KPI_IP): void {
  this.itemToDelete = item;
  this.showDeleteConfirm = true;
}
  confirmDelete(): void {
  if (this.itemToDelete) {
    this.kpiIpService.delete(this.itemToDelete.id!).subscribe({
      next: () => {
        this.fetchData();
        this.showDeleteConfirm = false;
        this.itemToDelete = null;
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.showDeleteConfirm = false;
        this.itemToDelete = null;
      }
    });
  }
}

cancelDelete(): void {
  this.showDeleteConfirm = false;
  this.itemToDelete = null;
}



  
toggleAddForm(): void {
  // If opening the form for adding a new entry (not editing), reset it
  if (!this.showAddForm && !this.editMode) {
    this.resetFormOnly(); // we'll define this next
  }
  this.showAddForm = !this.showAddForm;
}
resetFormOnly(): void {
  this.kpiForm.reset({
    titre: '',

    codeIp: '',
    semaine: null,
    annee: 2025,
    semaineAnnee: '',
    hseTag: false,
    emetteur: ''
  });

  this.editMode = false;
  this.editedItemId = null;
}


  updateSemaineAnnee(): void {
    const semaineControl = this.kpiForm.get('semaine');
    const anneeControl = this.kpiForm.get('annee');
    if (semaineControl && anneeControl) {
      const semaineAnnee = `${semaineControl.value}/${anneeControl.value}`;
      this.kpiForm.get('semaineAnnee')?.setValue(semaineAnnee);
    }
  }

onSubmit(): void {
  if (this.kpiForm.valid) {
    const kpiData: KPI_IP = {
      ...this.kpiForm.value,
      semaineAnnee: `${this.kpiForm.get('semaine')?.value}/${this.kpiForm.get('annee')?.value}`
    };

    if (this.editMode && this.editedItemId !== null) {
      // Update existing KPI
      this.kpiIpService.update(this.editedItemId, kpiData).subscribe({
        next: () => {
          this.fetchData();
          this.resetForm();
                    this.toastr.success('KPI modifié avec succès !', 'Succès');

        },
        error: (err) => {
          console.error('Update error:', err);
        }
      });
    } else {
      // Create new KPI
      this.kpiIpService.create(kpiData).subscribe({
        next: () => {
          this.fetchData();
          this.resetForm();
                    this.toastr.success('KPI ajouté avec succès !', 'Succès'); // 🎉 Here!

        },
        error: (err) => {
          console.error('Creation error:', err);
        }
      });
    }
  }
}
resetForm(): void {
  this.kpiForm.reset({
    titre: '',
  
    codeIp: '',
    semaine: null,
    annee: 2025,
    semaineAnnee: '',
    hseTag: false,
    emetteur: ''
  });
  this.editMode = false;
  this.editedItemId = null;
  this.showAddForm = false;
}
applySearch(): void {
  const query = this.searchQuery.toLowerCase().trim();
  if (!query) {
    this.filteredData = [...this.data]; // If search is empty, show all
    return;
  }

  this.filteredData = this.data.filter(item =>
    item.emetteur.toLowerCase().includes(query) ||
    item.codeIp.toLowerCase().includes(query) ||
    item.semaineAnnee.toLowerCase().includes(query) ||
    item.annee.toString().includes(query) ||
    item.semaine?.toString().includes(query)
  );
}
applyFilters(): void {
  this.filteredData = this.data.filter(item => {
    const matchSemaine = this.selectedSemaineAnnee ? item.semaineAnnee === this.selectedSemaineAnnee : true;
    const matchSearch = this.searchQuery
      ? Object.values(item).some(val => val?.toString().toLowerCase().includes(this.searchQuery.toLowerCase()))
      : true;
    return matchSemaine && matchSearch;
  });
}
showSuccess() {
  this.toastr.success('KPI ajouté avec succès !', 'Succès');
}

exportExcel(): void {
  // Prepare worksheet data
  const worksheetData = this.filteredData.map(item => ({
    'Titre': item.titre,
    'Code IP': item.codeIp,
    'Semaine': item.semaine,
    'Année': item.annee,
    'Semaine/Année': item.semaineAnnee,
    'HSE Tag': item.hseTag ? 'Oui' : 'Non',
    'Émetteur': item.emetteur
  }));

  // Create worksheet
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);

  // Set column widths for better UX
  ws['!cols'] = [
    { wch: 30 }, // Programme
    { wch: 15 }, // Code IP
    { wch: 10 }, // Semaine
    { wch: 10 }, // Année
    { wch: 15 }, // Semaine/Année
    { wch: 10 }, // HSE Tag
    { wch: 20 }, // Émetteur
  ];

  // Style header row: bold font, white text, dark blue background
  const range = XLSX.utils.decode_range(ws['!ref']!);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;

    ws[cellAddress].s = {
      font: {
        bold: true,
        color: { rgb: 'FFFFFFFF' },
        sz: 12,
      },
      fill: {
        fgColor: { rgb: 'FF1F497D' }
      },
      alignment: {
        horizontal: 'center',
        vertical: 'center'
      },
      border: {
        top: { style: "thin", color: { rgb: "FF000000" } },
        bottom: { style: "thin", color: { rgb: "FF000000" } },
        left: { style: "thin", color: { rgb: "FF000000" } },
        right: { style: "thin", color: { rgb: "FF000000" } },
      }
    };
  }

  // Apply borders and vertical alignment for all cells (including data rows)
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        alignment: {
          vertical: 'top',
          wrapText: true
        },
        border: {
          top: { style: "thin", color: { rgb: "FFCCCCCC" } },
          bottom: { style: "thin", color: { rgb: "FFCCCCCC" } },
          left: { style: "thin", color: { rgb: "FFCCCCCC" } },
          right: { style: "thin", color: { rgb: "FFCCCCCC" } },
        }
      };
    }
  }

  // Freeze the header row
  ws['!freeze'] = { ySplit: 1 };

  // Create workbook and add worksheet
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'KPI_IP_Data');

  // Export file with timestamped name
  const fileName = `KPI_IP_${new Date().toISOString().slice(0,10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}


}