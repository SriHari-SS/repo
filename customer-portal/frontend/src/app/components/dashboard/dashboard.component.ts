import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { Customer, DashboardData, Inquiry, SalesOrder, Delivery } from '../../models/customer.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  customer = signal<Customer | null>(null);
  dashboardData = signal<DashboardData | null>(null);
  loading = signal(true);
  error = signal('');
  
  // Active tab management
  activeTab = signal<'overview' | 'inquiries' | 'orders' | 'deliveries'>('overview');
  
  // Detailed data signals
  inquiries = signal<Inquiry[]>([]);
  salesOrders = signal<SalesOrder[]>([]);
  deliveries = signal<Delivery[]>([]);

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customer.set(this.authService.getCurrentCustomer());
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set('');

    this.customerService.getDashboard().subscribe({
      next: (response) => {
        this.loading.set(false);
        
        if (response.success && response.data) {
          this.dashboardData.set(response.data);
          // Load detailed data for tabs
          this.loadInquiries();
          this.loadSalesOrders();
          this.loadDeliveries();
        } else {
          this.error.set(response.message || 'Failed to load dashboard data');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set('Error loading dashboard data');
        console.error('Dashboard error:', error);
      }
    });
  }

  loadInquiries(): void {
    this.customerService.getInquiries().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.inquiries.set(response.data);
        }
      },
      error: (error) => console.error('Error loading inquiries:', error)
    });
  }

  loadSalesOrders(): void {
    this.customerService.getSalesOrders().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.salesOrders.set(response.data);
        }
      },
      error: (error) => console.error('Error loading sales orders:', error)
    });
  }

  loadDeliveries(): void {
    this.customerService.getDeliveries().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.deliveries.set(response.data);
        }
      },
      error: (error) => console.error('Error loading deliveries:', error)
    });
  }

  setActiveTab(tab: 'overview' | 'inquiries' | 'orders' | 'deliveries'): void {
    this.activeTab.set(tab);
    console.log(`Switched to ${tab} tab`);
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToFinancialSheet(): void {
    this.router.navigate(['/financial-sheet']);
  }

  // Utility methods for data formatting
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      // Inquiry statuses
      'Open': 'status-open',
      'In Progress': 'status-progress',
      'Quoted': 'status-quoted',
      'Converted': 'status-success',
      'Closed': 'status-closed',
      
      // Sales Order statuses
      'Created': 'status-created',
      'Confirmed': 'status-confirmed',
      'In Production': 'status-production',
      'Ready for Delivery': 'status-ready',
      'Delivered': 'status-delivered',
      'Invoiced': 'status-invoiced',
      'Completed': 'status-completed',
      
      // Delivery statuses
      'Planned': 'status-planned',
      'In Transit': 'status-transit',
      'Returned': 'status-returned',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || 'status-default';
  }

  getPriorityClass(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      'Low': 'priority-low',
      'Medium': 'priority-medium',
      'High': 'priority-high',
      'Urgent': 'priority-urgent'
    };
    return priorityMap[priority] || 'priority-default';
  }

  getPercentage(value: number): string {
    return `${Math.round(value)}%`;
  }
  
  // TrackBy functions for performance optimization
  trackByInquiry(index: number, item: any): string {
    return item.inquiryNumber;
  }
  
  trackBySalesOrder(index: number, item: any): string {
    return item.orderNumber;
  }
  
  trackByDelivery(index: number, item: any): string {
    return item.deliveryNumber;
  }
  
  trackByItem(index: number, item: any): string {
    return item.materialNumber || item.lineItem;
  }
}
