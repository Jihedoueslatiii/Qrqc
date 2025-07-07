import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, RegisterRequest } from '../services/auth-service.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.setupFormToggle();
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{8,15}$/)]],
      role: ['Client', Validators.required]
    });
  }

  private setupFormToggle(): void {
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton?.addEventListener('click', () => {
      container?.classList.add('right-panel-active');
    });

    signInButton?.addEventListener('click', () => {
      container?.classList.remove('right-panel-active');
    });
  }

onLogin(): void {
  if (this.loginForm.valid && !this.isLoading) {
    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    console.log('Attempting login with:', credentials.email);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful:', response);

        // Show SweetAlert2 success popup before navigating
        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie!',
          text: `Bienvenue ${response.user.firstName}!`,
          confirmButtonText: 'Continue'
        }).then(() => {
          // Navigate after user clicks "Continue"
          this.navigateBasedOnRole(response.user.role);
        });
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;

        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  } else {
    this.markFormGroupTouched(this.loginForm);
  }
}


  onRegister(): void {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.errorMessage = '';

      const userData: RegisterRequest = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        role: this.registerForm.value.role
      };

      console.log('Attempting registration with:', userData.email);

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          
          // Auto-login after successful registration
          const loginCredentials: LoginRequest = {
            email: userData.email,
            password: userData.password
          };
          
          this.authService.login(loginCredentials).subscribe({
            next: (loginResponse) => {
              console.log('Auto-login successful:', loginResponse);
              this.navigateBasedOnRole(loginResponse.user.role);
            },
            error: (loginError) => {
              console.error('Auto-login failed:', loginError);
              // Switch to login form
              document.getElementById('container')?.classList.remove('right-panel-active');
            }
          });
        },
        error: (error) => {
          console.error('Registration failed:', error);
          this.isLoading = false;
          
          if (error.error && error.error.error) {
            this.errorMessage = error.error.error;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.registerForm);
    }
  }

  private navigateBasedOnRole(role: string): void {
    switch (role) {
      case 'Admin':
        this.router.navigate(['/admin-dashboard']);
        break;
      case 'Project_Manager':
        this.router.navigate(['/stats']);
        break;
      case 'Employer':
        this.router.navigate(['/stats']);
        break;
      case 'Client':
      default:
        this.router.navigate(['/stats']);
        break;
    }
  }

  // Utility methods for form validation
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldDisplayName(fieldName)} format is invalid`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      password: 'Password',
      phone: 'Phone'
    };
    return displayNames[fieldName] || fieldName;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }

  // Method to test protected endpoint after login
  testProtectedEndpoint(): void {
    this.authService.testProtectedEndpoint().subscribe({
      next: (response) => {
        console.log('Protected endpoint test successful:', response);
      },
      error: (error) => {
        console.error('Protected endpoint test failed:', error);
      }
    });
  }
}