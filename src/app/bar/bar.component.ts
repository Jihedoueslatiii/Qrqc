import { Component, HostListener } from '@angular/core';
import { AuthService, User } from '../services/auth-service.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bar',
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.css']
})
export class BarComponent {
  isSidebarClosed: boolean = false;
    isUserDropdownOpen: boolean = false;
      currentUser: User | null = null;

  isDropdownOpen = false;

  dropdownStates: { [key: string]: boolean } = {
    dashboards: false,
    kpis: false,
    metrics: false,
    'financial-kpis': false,
    'project-kpis': false,
    'department-analytics': false,
    'performance-reports': false,
    'kpi-documentation': false,
    'analytics-chatbot': false
  };
  searchTerm: string = '';

  constructor(private authService: AuthService, private router: Router) { 
    this.currentUser = this.authService.getCurrentUser();

  }

logout(): void {
  Swal.fire({
    title: 'Êtes-vous sûr ?',
    text: "Vous allez être déconnecté de l'application.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Oui, me déconnecter',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.authService.logout();
      this.router.navigate(['/login']);
      Swal.fire({
        icon: 'success',
        title: 'Déconnecté',
        text: 'Vous avez été déconnecté avec succès.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  });
}
kpiIpExpanded: boolean = false;

toggleKpiIpMenu() {
  this.kpiIpExpanded = !this.kpiIpExpanded;
}


 

 toggleUserDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    // Delay closing to allow click events on dropdown items
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 150);
  }

  
  ngOnInit(): void {
    this.updateBodyClass();
  }

  toggleSidebar(): void {
    this.isSidebarClosed = !this.isSidebarClosed;
    this.updateBodyClass();
  }

  toggleDropdown(menuId: string): void {
    this.dropdownStates[menuId] = !this.dropdownStates[menuId];
  }

  onSearch(): void {
    if (this.searchTerm.trim()) {
      console.log('Searching for:', this.searchTerm);
    }
  }

  onSearchKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  private updateBodyClass(): void {
    const body = document.body;
    if (this.isSidebarClosed) {
      body.classList.add('sidebar-closed');
    } else {
      body.classList.remove('sidebar-closed');
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'b') {
      event.preventDefault();
      this.toggleSidebar();
    }
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('.search-box input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }

  @HostListener('window:resize', ['$event'])  
  onResize(event: Event): void {
    const target = event.target as Window;
    if (target.innerWidth <= 768) {
      if (!this.isSidebarClosed) {
        this.isSidebarClosed = true;
        this.updateBodyClass();
      }
    }
  }
}