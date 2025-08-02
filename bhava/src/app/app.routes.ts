import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { DashboardComponent } from './dashboard/dashboard';
import { ProfileComponent } from './vendor/profile/profile';
import { FinancialSheetComponent } from './financial/financial-sheet';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'financial', component: FinancialSheetComponent },
  { path: '**', redirectTo: '/login' }
];
