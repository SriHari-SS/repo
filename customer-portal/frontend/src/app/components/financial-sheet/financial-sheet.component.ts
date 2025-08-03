import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';

// Financial Data Interfaces
export interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  purchaseOrderNumber: string;
  description: string;
  currency: string;
  paymentTerms: string;
  agingDays: number;
}

export interface Payment {
  paymentId: string;
  invoiceNumber: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'check' | 'cash' | 'credit_card';
  reference: string;
  status: 'completed' | 'pending' | 'failed';
  currency: string;
}

export interface CreditDebitMemo {
  memoNumber: string;
  type: 'credit' | 'debit';
  date: string;
  amount: number;
  reason: string;
  invoiceReference?: string;
  status: 'active' | 'applied' | 'cancelled';
  description: string;
  currency: string;
}

export interface AgingBucket {
  period: string;
  daysRange: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface FinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  totalCreditMemos: number;
  totalDebitMemos: number;
  averagePaymentDays: number;
  currency: string;
}

@Component({
  selector: 'app-financial-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financial-sheet.component.html',
  styleUrls: ['./financial-sheet.component.scss']
})
export class FinancialSheetComponent implements OnInit {
  private customerService = inject(CustomerService);
  private router = inject(Router);

  // Signals for reactive data management
  invoices = signal<Invoice[]>([]);
  payments = signal<Payment[]>([]);
  creditDebitMemos = signal<CreditDebitMemo[]>([]);
  agingReport = signal<AgingBucket[]>([]);
  financialSummary = signal<FinancialSummary>({
    totalInvoiced: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    totalCreditMemos: 0,
    totalDebitMemos: 0,
    averagePaymentDays: 0,
    currency: 'INR'
  });

  // Loading and error states
  loading = signal(false);
  error = signal<string | null>(null);

  // Filter and display options
  selectedPeriod = signal('all');
  selectedStatus = signal('all');
  activeTab = signal('overview');

  // Date range filters
  dateFrom = signal('');
  dateTo = signal('');

  // Computed values
  filteredInvoices = computed(() => {
    let invoices = this.invoices();
    const period = this.selectedPeriod();
    const status = this.selectedStatus();
    const dateFrom = this.dateFrom();
    const dateTo = this.dateTo();

    // Filter by status
    if (status !== 'all') {
      invoices = invoices.filter(inv => inv.status === status);
    }

    // Filter by date range
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      invoices = invoices.filter(inv => {
        const invDate = new Date(inv.invoiceDate);
        return invDate >= fromDate && invDate <= toDate;
      });
    }

    // Filter by period
    if (period !== 'all') {
      const now = new Date();
      const periodDate = new Date();
      
      switch (period) {
        case '30':
          periodDate.setDate(now.getDate() - 30);
          break;
        case '60':
          periodDate.setDate(now.getDate() - 60);
          break;
        case '90':
          periodDate.setDate(now.getDate() - 90);
          break;
        case '365':
          periodDate.setDate(now.getDate() - 365);
          break;
      }
      
      if (period !== 'all') {
        invoices = invoices.filter(inv => new Date(inv.invoiceDate) >= periodDate);
      }
    }

    return invoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
  });

  filteredPayments = computed(() => {
    let payments = this.payments();
    const dateFrom = this.dateFrom();
    const dateTo = this.dateTo();

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      payments = payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate >= fromDate && paymentDate <= toDate;
      });
    }

    return payments.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  });

  filteredMemos = computed(() => {
    let memos = this.creditDebitMemos();
    const dateFrom = this.dateFrom();
    const dateTo = this.dateTo();

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      memos = memos.filter(memo => {
        const memoDate = new Date(memo.date);
        return memoDate >= fromDate && memoDate <= toDate;
      });
    }

    return memos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  async ngOnInit() {
    await this.loadFinancialData();
  }

  async loadFinancialData() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const [invoices, payments, memos, aging, summary] = await Promise.all([
        this.customerService.getInvoices(),
        this.customerService.getPayments(),
        this.customerService.getCreditDebitMemos(),
        this.customerService.getAgingReport(),
        this.customerService.getFinancialSummary()
      ]);

      this.invoices.set(invoices);
      this.payments.set(payments);
      this.creditDebitMemos.set(memos);
      this.agingReport.set(aging);
      this.financialSummary.set(summary);
    } catch (error) {
      console.error('Error loading financial data:', error);
      this.error.set('Failed to load financial data. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  // Utility methods
  calculateAging(billingDate: string, dueDate: string): number {
    const billing = new Date(billingDate);
    const due = new Date(dueDate);
    const today = new Date();
    
    // If invoice is not yet due, return 0
    if (today <= due) return 0;
    
    // Calculate days overdue
    const diffTime = today.getTime() - due.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'paid': 'status-paid',
      'pending': 'status-pending',
      'overdue': 'status-overdue',
      'partial': 'status-partial',
      'completed': 'status-completed',
      'failed': 'status-failed',
      'active': 'status-active',
      'applied': 'status-applied',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  getPriorityClass(agingDays: number): string {
    if (agingDays <= 0) return 'priority-current';
    if (agingDays <= 30) return 'priority-low';
    if (agingDays <= 60) return 'priority-medium';
    if (agingDays <= 90) return 'priority-high';
    return 'priority-critical';
  }

  formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Filter methods
  onPeriodChange(period: string) {
    this.selectedPeriod.set(period);
  }

  onStatusChange(status: string) {
    this.selectedStatus.set(status);
  }

  onDateRangeChange(from: string, to: string) {
    this.dateFrom.set(from);
    this.dateTo.set(to);
  }

  // Tab navigation
  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  // Export functionality
  exportToPDF() {
    // Implementation for PDF export
    console.log('Exporting financial sheet to PDF...');
  }

  exportToExcel() {
    // Implementation for Excel export
    console.log('Exporting financial sheet to Excel...');
  }

  // Print functionality
  printFinancialSheet() {
    window.print();
  }

  // Track by functions for ngFor performance
  trackByInvoice(index: number, invoice: Invoice): string {
    return invoice.invoiceNumber;
  }

  trackByPayment(index: number, payment: Payment): string {
    return payment.paymentId;
  }

  trackByMemo(index: number, memo: CreditDebitMemo): string {
    return memo.memoNumber;
  }

  trackByAging(index: number, aging: AgingBucket): string {
    return aging.period;
  }
}
