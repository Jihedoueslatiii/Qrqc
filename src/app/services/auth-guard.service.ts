import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    if (this.authService.isLoggedIn()) {
      // Check if route requires specific role
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser && requiredRoles.includes(currentUser.role)) {
          return true;
        } else {
          // User doesn't have required role
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }
      
      return true;
    }

    // Not logged in, redirect to login page
    this.router.navigate(['/login']);
    return false;
  }
}

// Usage in your routing module:
/*
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'kpi-ip', 
    component: KpiComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }
  },
  { 
    path: 'manager-dashboard', 
    component: ManagerDashboardComponent, 
    canActivate: [AuthGuard],
    data: { roles: ['Project_Manager'] }
  },
  // ... other routes
];
*/