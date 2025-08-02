import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../auth/auth';
import { VendorData } from '../models/vendor.model';
import { FinancialService } from '../services/financial.service';
import { 
  Invoice, 
  PaymentHistory, 
  CreditDebitMemo, 
  FinancialSummary,
  AgingReport,
  InvoiceFilter,
  PaymentFilter,
  MemoFilter
} from '../models/financial.model';

@Component({
  selector: 'app-financial-sheet',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './financial-sheet.html',
  styleUrls: ['./financial-sheet.scss']
})
export class FinancialSheetComponent implements OnInit, OnDestroy {
  vendor: VendorData | null = null;
  private destroy$ = new Subject<void>();
  
  // Expose Math to template
  Math = Math;
  
  // Active tab management
  activeTab: 'overview' | 'invoices' | 'payments' | 'memos' = 'overview';
  
  // Data properties
  financialSummary: FinancialSummary | null = null;
  invoices: Invoice[] = [];
  payments: PaymentHistory[] = [];
  memos: CreditDebitMemo[] = [];
  agingReport: AgingReport | null = null;
  
  // Loading states
  isLoadingSummary = false;
  isLoadingInvoices = false;
  isLoadingPayments = false;
  isLoadingMemos = false;
  isLoadingAging = false;
  
  // Filter forms
  invoiceFilterForm!: FormGroup;
  paymentFilterForm!: FormGroup;
  memoFilterForm!: FormGroup;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalRecords = 0;
  
  // Search
  searchTerm = '';

  constructor(
    private authService: AuthService,
    private financialService: FinancialService,
    private formBuilder: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.authService.currentVendor$
      .pipe(takeUntil(this.destroy$))
      .subscribe(vendor => {
        this.vendor = vendor;
        if (vendor) {
          this.loadFinancialData();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms(): void {
    this.invoiceFilterForm = this.formBuilder.group({
      status: [''],
      dateFrom: [''],
      dateTo: [''],
      amountFrom: [''],
      amountTo: [''],
      paymentStatus: ['']
    });

    this.paymentFilterForm = this.formBuilder.group({
      dateFrom: [''],
      dateTo: [''],
      amountFrom: [''],
      amountTo: [''],
      paymentMethod: ['']
    });

    this.memoFilterForm = this.formBuilder.group({
      memoType: [''],
      dateFrom: [''],
      dateTo: [''],
      status: ['']
    });
  }

  private loadFinancialData(): void {
    if (!this.vendor?.vendorId) return;
    
    this.loadFinancialSummary();
    this.loadInvoices();
    this.loadPayments();
    this.loadMemos();
    this.loadAgingReport();
  }

  private loadFinancialSummary(): void {
    if (!this.vendor?.vendorId) return;
    
    this.isLoadingSummary = true;
    this.financialService.getFinancialSummary(this.vendor.vendorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.financialSummary = summary;
          this.isLoadingSummary = false;
        },
        error: (error) => {
          console.error('Error loading financial summary:', error);
          this.isLoadingSummary = false;
          // Use mock data for demonstration
          this.financialSummary = this.getMockFinancialSummary();
        }
      });
  }

  private loadInvoices(page: number = 1): void {
    if (!this.vendor?.vendorId) return;
    
    this.isLoadingInvoices = true;
    const filter = this.getInvoiceFilter();
    
    this.financialService.getInvoices(this.vendor.vendorId, filter, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.invoices = response.invoices;
          this.totalRecords = response.totalCount;
          this.isLoadingInvoices = false;
        },
        error: (error) => {
          console.error('Error loading invoices:', error);
          this.isLoadingInvoices = false;
          this.invoices = this.getMockInvoices();
        }
      });
  }

  private loadPayments(page: number = 1): void {
    if (!this.vendor?.vendorId) return;
    
    this.isLoadingPayments = true;
    const filter = this.getPaymentFilter();
    
    this.financialService.getPaymentHistory(this.vendor.vendorId, filter, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.payments = response.payments;
          this.isLoadingPayments = false;
        },
        error: (error) => {
          console.error('Error loading payments:', error);
          this.isLoadingPayments = false;
          this.payments = this.getMockPayments();
        }
      });
  }

  private loadMemos(page: number = 1): void {
    if (!this.vendor?.vendorId) return;
    
    this.isLoadingMemos = true;
    const filter = this.getMemoFilter();
    
    this.financialService.getCreditDebitMemos(this.vendor.vendorId, filter, page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.memos = response.memos;
          this.isLoadingMemos = false;
        },
        error: (error) => {
          console.error('Error loading memos:', error);
          this.isLoadingMemos = false;
          this.memos = this.getMockMemos();
        }
      });
  }

  private loadAgingReport(): void {
    if (!this.vendor?.vendorId) return;
    
    this.isLoadingAging = true;
    this.financialService.getAgingReport(this.vendor.vendorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.agingReport = response.agingReport;
          this.isLoadingAging = false;
        },
        error: (error) => {
          console.error('Error loading aging report:', error);
          this.isLoadingAging = false;
          this.agingReport = this.getMockAgingReport();
        }
      });
  }

  // Tab navigation
  setActiveTab(tab: 'overview' | 'invoices' | 'payments' | 'memos'): void {
    this.activeTab = tab;
    this.currentPage = 1;
  }

  // Filter methods
  private getInvoiceFilter(): InvoiceFilter | undefined {
    const formValue = this.invoiceFilterForm.value;
    if (!formValue.status && !formValue.dateFrom && !formValue.dateTo) {
      return undefined;
    }
    
    return {
      status: formValue.status ? [formValue.status] : undefined,
      dateFrom: formValue.dateFrom ? new Date(formValue.dateFrom) : undefined,
      dateTo: formValue.dateTo ? new Date(formValue.dateTo) : undefined,
      paymentStatus: formValue.paymentStatus ? [formValue.paymentStatus] : undefined
    };
  }

  private getPaymentFilter(): PaymentFilter | undefined {
    const formValue = this.paymentFilterForm.value;
    if (!formValue.dateFrom && !formValue.dateTo && !formValue.paymentMethod) {
      return undefined;
    }
    
    return {
      dateFrom: formValue.dateFrom ? new Date(formValue.dateFrom) : undefined,
      dateTo: formValue.dateTo ? new Date(formValue.dateTo) : undefined,
      paymentMethod: formValue.paymentMethod ? [formValue.paymentMethod] : undefined
    };
  }

  private getMemoFilter(): MemoFilter | undefined {
    const formValue = this.memoFilterForm.value;
    if (!formValue.memoType && !formValue.dateFrom && !formValue.dateTo) {
      return undefined;
    }
    
    return {
      memoType: formValue.memoType ? [formValue.memoType] : undefined,
      dateFrom: formValue.dateFrom ? new Date(formValue.dateFrom) : undefined,
      dateTo: formValue.dateTo ? new Date(formValue.dateTo) : undefined
    };
  }

  // Event handlers
  onFilterChange(): void {
    this.currentPage = 1;
    if (this.activeTab === 'invoices') {
      this.loadInvoices();
    } else if (this.activeTab === 'payments') {
      this.loadPayments();
    } else if (this.activeTab === 'memos') {
      this.loadMemos();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    if (this.activeTab === 'invoices') {
      this.loadInvoices(page);
    } else if (this.activeTab === 'payments') {
      this.loadPayments(page);
    } else if (this.activeTab === 'memos') {
      this.loadMemos(page);
    }
  }

  onSearch(): void {
    // Implement search functionality
    console.log('Searching for:', this.searchTerm);
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return this.financialService.formatCurrency(amount);
  }

  calculateAging(invoiceDate: Date, dueDate: Date): number {
    return this.financialService.calculateAging(invoiceDate, dueDate);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'status-success';
      case 'overdue': return 'status-danger';
      case 'pending': return 'status-warning';
      case 'approved': return 'status-info';
      default: return 'status-default';
    }
  }

  getAgingClass(days: number): string {
    if (days <= 0) return 'aging-current';
    if (days <= 30) return 'aging-warning';
    if (days <= 60) return 'aging-danger';
    return 'aging-critical';
  }

  // Mock data methods (for demonstration)
  private getMockFinancialSummary(): FinancialSummary {
    return {
      vendorId: this.vendor?.vendorId || '',
      currency: 'USD',
      totalInvoiced: 750000,
      totalPaid: 620000,
      totalOutstanding: 130000,
      overdueAmount: 45000,
      creditMemoTotal: 5000,
      debitMemoTotal: 2000,
      averagePaymentDays: 28,
      invoiceCount: {
        total: 24,
        pending: 8,
        paid: 14,
        overdue: 2
      },
      memoCount: {
        creditMemos: 3,
        debitMemos: 1
      },
      lastPaymentDate: new Date('2024-01-25'),
      nextDueDate: new Date('2024-02-15')
    };
  }

  private getMockInvoices(): Invoice[] {
    return [
      {
        invoiceNumber: 'INV-2024-001',
        invoiceType: 'STANDARD',
        poNumber: 'PO-2024-001',
        grNumber: 'GR-2024-001',
        vendorId: this.vendor?.vendorId || '',
        companyCode: '1000',
        invoiceDate: new Date('2024-01-15'),
        postingDate: new Date('2024-01-16'),
        dueDate: new Date('2024-02-14'),
        paymentTerms: 'NET30',
        currency: 'USD',
        grossAmount: 125000,
        taxAmount: 12500,
        netAmount: 112500,
        status: 'APPROVED',
        paymentStatus: 'OPEN',
        items: [],
        taxDetails: [],
        paymentHistory: []
      }
    ];
  }

  private getMockPayments(): PaymentHistory[] {
    return [
      {
        paymentId: 'PAY-2024-001',
        paymentDate: new Date('2024-01-25'),
        invoiceNumbers: ['INV-2023-045', 'INV-2023-046'],
        totalAmount: 85000,
        currency: 'USD',
        paymentMethod: 'BANK_TRANSFER',
        paymentReference: 'TXN-2024-001',
        status: 'COMPLETED'
      }
    ];
  }

  private getMockMemos(): CreditDebitMemo[] {
    return [
      {
        memoNumber: 'CM-2024-001',
        memoType: 'CREDIT_MEMO',
        referenceInvoice: 'INV-2023-042',
        vendorId: this.vendor?.vendorId || '',
        companyCode: '1000',
        memoDate: new Date('2024-01-20'),
        postingDate: new Date('2024-01-21'),
        currency: 'USD',
        amount: 5000,
        taxAmount: 500,
        netAmount: 4500,
        reason: 'Quality issues with delivered goods',
        reasonCode: 'QUALITY',
        status: 'APPROVED',
        items: [],
        createdBy: 'John Procurement',
        createdDate: new Date('2024-01-20')
      }
    ];
  }

  private getMockAgingReport(): AgingReport {
    return {
      vendorId: this.vendor?.vendorId || '',
      vendorName: this.vendor?.vendorName || '',
      currency: 'USD',
      asOfDate: new Date(),
      totalOutstanding: 130000,
      agingBuckets: [
        {
          periodDescription: 'Current',
          daysFrom: 0,
          daysTo: 0,
          amount: 75000,
          invoiceCount: 6,
          percentage: 57.7
        },
        {
          periodDescription: '1-30 days',
          daysFrom: 1,
          daysTo: 30,
          amount: 30000,
          invoiceCount: 2,
          percentage: 23.1
        },
        {
          periodDescription: '31-60 days',
          daysFrom: 31,
          daysTo: 60,
          amount: 20000,
          invoiceCount: 1,
          percentage: 15.4
        },
        {
          periodDescription: '60+ days',
          daysFrom: 61,
          daysTo: 999,
          amount: 5000,
          invoiceCount: 1,
          percentage: 3.8
        }
      ],
      overdueAmount: 55000,
      averageDaysOutstanding: 25
    };
  }
}
