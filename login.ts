import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
 
import { LoginService } from './login.service';
import { ThemeService } from '../theme';
 
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  fb = inject(FormBuilder);
  router = inject(Router);
  loginService = inject(LoginService);
  themeService = inject(ThemeService);
  form: FormGroup = this.fb.group({
    customerId: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(5)]],
    rememberMe: [false]
  });
  loading = signal(false);
  error = signal('');
  darkMode = this.themeService.getDarkMode();
 
  toggleTheme() {
    this.themeService.toggleTheme();
  }
 
  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.loading.set(true);
    this.error.set('');
 
    const customerId = this.form.get('customerId')?.value;
    const password = this.form.get('password')?.value;
    const rememberMe = this.form.get('rememberMe')?.value;
 
    this.loginService.login(customerId, password, rememberMe).subscribe({
      next: response => {
        this.loading.set(false);
        if (response?.message === 'Login Successful') {
          this.loginService.setCustomerId(customerId);
          this.router.navigate(['/profile']);
        } else {
          this.error.set(response?.message || 'Login failed. Please check your credentials.');
        }
      },
      error: err => {
        console.error('Login failed:', err);
        this.loading.set(false);
        this.error.set('Login failed. Please check your Customer ID and password.');
      }
    });
  }
}