import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LeaveManagementComponent } from './components/leave-management/leave-management.component';
import { PayslipComponent } from './components/payslip/payslip.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'profile/:employeeId', component: ProfileComponent },
  { path: 'leave-management', component: LeaveManagementComponent },
  { path: 'leave-management/:employeeId', component: LeaveManagementComponent },
  { path: 'payslip', component: PayslipComponent },
  { path: 'payslip/:employeeId', component: PayslipComponent },
  { path: '**', redirectTo: '/login' }
];
