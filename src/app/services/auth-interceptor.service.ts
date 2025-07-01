import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth-service.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth headers for login and register endpoints
    const isAuthEndpoint = req.url.includes('/login') || req.url.includes('/register');
    
    if (isAuthEndpoint) {
      return next.handle(req).pipe(
        catchError(this.handleError.bind(this))
      );
    }

    // Get the token from the auth service
    const token = this.authService.getToken();

    // Clone the request and add the authorization header if token exists
    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // Handle the request and catch any errors
    return next.handle(authReq).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('HTTP Error:', error);
    
    if (error.status === 401 || error.status === 403) {
      // Clear the token and redirect to login
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    
    return throwError(() => error);
  }
}

// App Module Configuration Example:
/*
import { HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // ... other providers
  ],
  // ... other module configuration
})
export class AppModule { }
*/