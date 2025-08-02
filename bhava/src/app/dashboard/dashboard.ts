import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth';
import { VendorData } from '../models/vendor.model';
import { BusinessTransactionService } from '../services/business-transaction.service';
import { BusinessTransactionSummary } from '../models/business-transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  vendor: VendorData | null = null;
  currentTime = new Date();
  private destroy$ = new Subject<void>();
  
  // Active tab management
  activeTab: 'overview' | 'rfq' | 'po' | 'gr' = 'overview';
  
  // Business transaction summary
  businessSummary: BusinessTransactionSummary | null = null;
  isLoadingSummary = false;

  // Dashboard statistics (these would come from API calls in real implementation)
  dashboardStats = {
    pendingOrders: 12,
    totalRevenue: 245670,
    openInvoices: 5,
    deliveredOrders: 89
  };

  // Recent activities (would come from API in real implementation)
  recentActivities = [
    { type: 'order', description: 'New order #PO-2024-001 received', time: '2 hours ago', status: 'new' },
    { type: 'invoice', description: 'Invoice #INV-2024-045 paid', time: '5 hours ago', status: 'completed' },
    { type: 'delivery', description: 'Order #PO-2024-003 delivered', time: '1 day ago', status: 'completed' },
    { type: 'order', description: 'Order #PO-2024-002 confirmed', time: '2 days ago', status: 'processing' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private businessTransactionService: BusinessTransactionService
  ) {}

  ngOnInit(): void {
    // Update current time every minute
    setInterval(() => {
      this.currentTime = new Date();
    }, 60000);

    // Subscribe to current vendor data
    this.authService.currentVendor$
      .pipe(takeUntil(this.destroy$))
      .subscribe(vendor => {
        this.vendor = vendor;
        if (!vendor) {
          this.router.navigate(['/login']);
        } else {
          // Load business transaction summary when vendor data is available
          this.loadBusinessTransactionSummary();
        }
      });

    // If no vendor data, redirect to login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  private loadBusinessTransactionSummary(): void {
    if (!this.vendor?.vendorId) return;
    
    this.isLoadingSummary = true;
    this.businessTransactionService.getBusinessTransactionSummary(this.vendor.vendorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.businessSummary = summary;
          this.isLoadingSummary = false;
        },
        error: (error) => {
          console.error('Error loading business transaction summary:', error);
          this.isLoadingSummary = false;
          // Use mock data for demonstration
          this.businessSummary = this.getMockBusinessSummary();
        }
      });
  }

  private getMockBusinessSummary(): BusinessTransactionSummary {
    return {
      rfqSummary: {
        total: 15,
        open: 8,
        submitted: 4,
        awarded: 2,
        expired: 1
      },
      poSummary: {
        total: 23,
        open: 12,
        partiallyDelivered: 7,
        fullyDelivered: 4,
        totalValue: 450000
      },
      grSummary: {
        total: 18,
        posted: 15,
        pending: 2,
        qualityCheck: 1,
        totalValue: 380000
      }
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Tab navigation methods
  setActiveTab(tab: 'overview' | 'rfq' | 'po' | 'gr'): void {
    this.activeTab = tab;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToFinancialSheet(): void {
    this.router.navigate(['/financial']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'order': return '📦';
      case 'invoice': return '💳';
      case 'delivery': return '🚚';
      default: return '📄';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'new': return 'status-new';
      case 'processing': return 'status-processing';
      case 'completed': return 'status-completed';
      default: return 'status-default';
    }
  }

  // Vendor profile display methods
  getVendorInitials(): string {
    if (!this.vendor?.vendorName) return 'V';
    return this.vendor.vendorName
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getPartnershipDuration(): string {
    // This would come from VendorProfile in real implementation
    // For now, we'll use a mock calculation
    const mockRegistrationDate = new Date('2020-03-15'); // Mock date
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - mockRegistrationDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears > 0 ? `${diffYears} years` : 'Less than 1 year';
  }

  getTotalTransactions(): number {
    if (!this.businessSummary) return 0;
    return (this.businessSummary.rfqSummary?.total || 0) + 
           (this.businessSummary.poSummary?.total || 0) + 
           (this.businessSummary.grSummary?.total || 0);
  }

  getCreditRating(): string {
    // This would come from SAP in real implementation
    return 'AAA';
  }

  getPerformanceScore(): number {
    // This would be calculated from various metrics in SAP
    return 95;
  }
}
