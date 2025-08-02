import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VendorService } from '../vendor';
import { AuthService } from '../../auth/auth';
import { VendorProfile, VendorData } from '../../models/vendor.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  vendorProfile: VendorProfile | null = null;
  currentVendor: VendorData | null = null;
  isLoading = false;
  errorMessage = '';
  lastSyncDate: Date | null = null;
  
  private destroy$ = new Subject<void>();

  // Active tab management
  activeTab: 'overview' | 'contact' | 'address' | 'banking' | 'documents' | 'compliance' | 'customer' = 'overview';

  constructor(
    private vendorService: VendorService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current vendor data
    this.authService.currentVendor$
      .pipe(takeUntil(this.destroy$))
      .subscribe(vendor => {
        this.currentVendor = vendor;
        if (vendor) {
          this.loadVendorProfile(vendor.vendorId);
        } else {
          this.router.navigate(['/login']);
        }
      });

    // Subscribe to loading state
    this.vendorService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });

    // Subscribe to vendor profile updates
    this.vendorService.vendorProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.vendorProfile = profile;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVendorProfile(vendorId: string): void {
    this.errorMessage = '';
    
    this.vendorService.getVendorProfile(vendorId).subscribe({
      next: (response) => {
        if (response.success) {
          this.lastSyncDate = response.lastSyncDate || new Date();
        } else {
          this.errorMessage = response.message || 'Failed to load vendor profile';
        }
      },
      error: (error) => {
        console.error('Error loading vendor profile:', error);
        if (error.status === 404) {
          this.errorMessage = 'Vendor profile not found in SAP system';
        } else if (error.status === 403) {
          this.errorMessage = 'Access denied. You do not have permission to view this profile';
        } else if (error.status === 500) {
          this.errorMessage = 'SAP system temporarily unavailable. Please try again later';
        } else {
          this.errorMessage = 'Failed to load vendor profile. Please check your connection';
        }
      }
    });
  }

  refreshProfile(): void {
    if (this.currentVendor) {
      this.errorMessage = '';
      
      this.vendorService.refreshVendorProfile(this.currentVendor.vendorId).subscribe({
        next: (response) => {
          if (response.success) {
            this.lastSyncDate = response.lastSyncDate || new Date();
            // Show success message briefly
            setTimeout(() => {
              // Could show a toast notification here
            }, 2000);
          } else {
            this.errorMessage = response.message || 'Failed to refresh vendor profile';
          }
        },
        error: (error) => {
          console.error('Error refreshing vendor profile:', error);
          this.errorMessage = 'Failed to refresh profile from SAP. Please try again';
        }
      });
    }
  }

  setActiveTab(tab: typeof this.activeTab): void {
    this.activeTab = tab;
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  }

  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'status-success';
      case 'pending':
        return 'status-warning';
      case 'suspended':
      case 'rejected':
      case 'expired':
        return 'status-error';
      default:
        return 'status-default';
    }
  }

  getAddressTypeIcon(type: string): string {
    switch (type) {
      case 'HEADQUARTERS': return '🏢';
      case 'BILLING': return '💳';
      case 'SHIPPING': return '📦';
      case 'REMIT_TO': return '💰';
      default: return '📍';
    }
  }

  getCertificationStatusIcon(status: string): string {
    switch (status) {
      case 'ACTIVE': return '✅';
      case 'EXPIRED': return '⚠️';
      case 'SUSPENDED': return '❌';
      default: return '📋';
    }
  }

  getDocumentTypeIcon(type: string): string {
    switch (type) {
      case 'CONTRACT': return '📄';
      case 'CERTIFICATE': return '🏆';
      case 'TAX_FORM': return '📋';
      case 'INSURANCE': return '🛡️';
      default: return '📁';
    }
  }

  downloadDocument(documentId: string): void {
    // Implementation for document download
    console.log('Downloading document:', documentId);
  }

  isDocumentExpiringSoon(expiryDate: Date): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  }

  isDocumentExpired(expiryDate: Date): boolean {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    return expiry < today;
  }
}
