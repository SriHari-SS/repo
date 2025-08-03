import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, Employee } from '../../services/auth.service';
import { ProfileService, EmployeeProfile } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  employee: Employee | null = null;
  employeeProfile: EmployeeProfile | null = null;
  isLoading = false;
  errorMessage = '';
  lastSyncTime: Date | null = null;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current employee data
    this.employee = this.authService.getCurrentEmployee();
    
    if (this.employee) {
      this.loadEmployeeProfile();
    }
  }

  /**
   * Load complete employee profile from SAP ERP via SAP PO
   */
  loadEmployeeProfile(): void {
    if (!this.employee) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.profileService.getEmployeeProfile(this.employee.employeeId).subscribe({
      next: (profile) => {
        this.employeeProfile = profile;
        this.lastSyncTime = new Date();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Profile loading error:', error);
        
        if (error.status === 0) {
          this.errorMessage = 'Unable to connect to SAP ERP system. Please check your connection.';
        } else if (error.status === 404) {
          this.errorMessage = 'Employee profile not found in SAP system.';
        } else if (error.status === 500) {
          this.errorMessage = 'SAP ERP system is currently unavailable. Please try again later.';
        } else {
          this.errorMessage = error.error?.message || 'Failed to load employee profile.';
        }
      }
    });
  }

  /**
   * Refresh employee profile data from SAP
   */
  refreshProfile(): void {
    this.loadEmployeeProfile();
  }

  /**
   * Navigate back to dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Edit profile (placeholder for future implementation)
   */
  editProfile(): void {
    console.log('Edit profile functionality - to be implemented');
    // Future: Navigate to profile edit page
  }

  /**
   * Download profile as PDF (placeholder for future implementation)
   */
  downloadProfile(): void {
    console.log('Download profile functionality - to be implemented');
    // Future: Generate and download PDF profile
  }

  /**
   * Get profile image URL
   */
  getProfileImageUrl(): string {
    if (this.employeeProfile?.photoUrl) {
      return this.employeeProfile.photoUrl;
    }
    // Fallback to generated avatar
    return `https://ui-avatars.com/api/?name=${this.employee?.name}&background=14b8a6&color=fff&size=150`;
  }

  /**
   * Calculate years of service
   */
  calculateYearsOfService(): string {
    if (!this.employeeProfile?.joiningDate) return 'N/A';
    
    const joining = new Date(this.employeeProfile.joiningDate);
    const now = new Date();
    const years = now.getFullYear() - joining.getFullYear();
    const months = now.getMonth() - joining.getMonth();
    
    if (months < 0 || (months === 0 && now.getDate() < joining.getDate())) {
      return `${years - 1} years, ${12 + months} months`;
    }
    
    return `${years} years, ${months} months`;
  }

  /**
   * Get employment status color
   */
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#ef4444';
      case 'on leave':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }

  /**
   * Format salary for display
   */
  formatSalary(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get relative time for last sync
   */
  getLastSyncTime(): string {
    if (!this.lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - this.lastSyncTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
