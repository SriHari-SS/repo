import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  isDevelopment = true; // Set to false in production

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      employeeId: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginRequest = {
        employeeId: this.loginForm.value.employeeId.toUpperCase(),
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login response received:', response);
          this.isLoading = false;
          
          if (response.success) {
            console.log('Login successful, navigating to dashboard...');
            this.router.navigate(['/dashboard']).then(
              (success) => {
                if (success) {
                  console.log('Navigation to dashboard successful');
                } else {
                  console.error('Navigation to dashboard failed');
                  this.errorMessage = 'Login successful but navigation failed';
                }
              }
            );
          } else {
            console.error('Login failed:', response.message);
            this.errorMessage = response.message || 'Login failed';
          }
        },
        error: (error) => {
          console.error('Login error details:', error);
          this.isLoading = false;
          
          if (error.error && error.error.message) {
            this.errorMessage = error.error.message;
          } else if (error.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please ensure the backend is running on port 3001.';
          } else if (error.status === 401) {
            this.errorMessage = 'Invalid credentials. Please check your Employee ID and password.';
          } else if (error.status === 400) {
            this.errorMessage = 'Invalid request. Please check your input format.';
          } else if (error.status >= 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = `Connection error (${error.status}). Please try again.`;
          }
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Get error message for employee ID field
   */
  getEmployeeIdErrorMessage(): string {
    const control = this.loginForm.get('employeeId');
    if (control?.hasError('required')) {
      return 'Employee ID is required';
    }
    if (control?.hasError('minlength')) {
      return 'Employee ID must be at least 3 characters';
    }
    return '';
  }

  /**
   * Get error message for password field
   */
  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) {
      return 'Password is required';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 3 characters long';
    }
    return '';
  }

  /**
   * Check if field has error and is touched
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
