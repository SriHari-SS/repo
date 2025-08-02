import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Invoice, 
  PaymentHistory, 
  CreditDebitMemo, 
  AgingReport,
  FinancialSummary,
  InvoiceResponse,
  PaymentResponse,
  MemoResponse,
  AgingResponse,
  InvoiceFilter,
  PaymentFilter,
  MemoFilter
} from '../models/financial.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Invoice Management Methods
  getInvoices(
    vendorId: string, 
    filter?: InvoiceFilter, 
    page: number = 1, 
    pageSize: number = 10
  ): Observable<InvoiceResponse> {
    let url = `${this.apiUrl}/api/invoices/vendor/${vendorId}?page=${page}&pageSize=${pageSize}`;
    
    if (filter) {
      if (filter.status?.length) {
        url += `&status=${filter.status.join(',')}`;
      }
      if (filter.dateFrom) {
        url += `&dateFrom=${filter.dateFrom.toISOString()}`;
      }
      if (filter.dateTo) {
        url += `&dateTo=${filter.dateTo.toISOString()}`;
      }
      if (filter.paymentStatus?.length) {
        url += `&paymentStatus=${filter.paymentStatus.join(',')}`;
      }
    }
    
    return this.http.get<InvoiceResponse>(url, { headers: this.getHeaders() });
  }

  getInvoiceById(invoiceNumber: string): Observable<Invoice> {
    return this.http.get<Invoice>(
      `${this.apiUrl}/api/invoices/${invoiceNumber}`, 
      { headers: this.getHeaders() }
    );
  }

  submitInvoice(invoiceData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    
    return this.http.post(
      `${this.apiUrl}/api/invoices/submit`,
      invoiceData,
      { headers }
    );
  }

  downloadInvoicePDF(invoiceNumber: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/api/invoices/${invoiceNumber}/pdf`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  // Payment and Aging Methods
  getPaymentHistory(
    vendorId: string, 
    filter?: PaymentFilter, 
    page: number = 1, 
    pageSize: number = 10
  ): Observable<PaymentResponse> {
    let url = `${this.apiUrl}/api/payments/vendor/${vendorId}?page=${page}&pageSize=${pageSize}`;
    
    if (filter) {
      if (filter.dateFrom) {
        url += `&dateFrom=${filter.dateFrom.toISOString()}`;
      }
      if (filter.dateTo) {
        url += `&dateTo=${filter.dateTo.toISOString()}`;
      }
      if (filter.paymentMethod?.length) {
        url += `&paymentMethod=${filter.paymentMethod.join(',')}`;
      }
    }
    
    return this.http.get<PaymentResponse>(url, { headers: this.getHeaders() });
  }

  getAgingReport(vendorId: string, asOfDate?: Date): Observable<AgingResponse> {
    let url = `${this.apiUrl}/api/aging/vendor/${vendorId}`;
    if (asOfDate) {
      url += `?asOfDate=${asOfDate.toISOString()}`;
    }
    return this.http.get<AgingResponse>(url, { headers: this.getHeaders() });
  }

  getFinancialSummary(vendorId: string): Observable<FinancialSummary> {
    return this.http.get<FinancialSummary>(
      `${this.apiUrl}/api/financial/summary/vendor/${vendorId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Credit/Debit Memo Methods
  getCreditDebitMemos(
    vendorId: string, 
    filter?: MemoFilter, 
    page: number = 1, 
    pageSize: number = 10
  ): Observable<MemoResponse> {
    let url = `${this.apiUrl}/api/memos/vendor/${vendorId}?page=${page}&pageSize=${pageSize}`;
    
    if (filter) {
      if (filter.memoType?.length) {
        url += `&memoType=${filter.memoType.join(',')}`;
      }
      if (filter.dateFrom) {
        url += `&dateFrom=${filter.dateFrom.toISOString()}`;
      }
      if (filter.dateTo) {
        url += `&dateTo=${filter.dateTo.toISOString()}`;
      }
      if (filter.status?.length) {
        url += `&status=${filter.status.join(',')}`;
      }
    }
    
    return this.http.get<MemoResponse>(url, { headers: this.getHeaders() });
  }

  getMemoById(memoNumber: string): Observable<CreditDebitMemo> {
    return this.http.get<CreditDebitMemo>(
      `${this.apiUrl}/api/memos/${memoNumber}`, 
      { headers: this.getHeaders() }
    );
  }

  createCreditMemo(memoData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/memos/credit`,
      memoData,
      { headers: this.getHeaders() }
    );
  }

  createDebitMemo(memoData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/memos/debit`,
      memoData,
      { headers: this.getHeaders() }
    );
  }

  // Utility Methods
  calculateAging(invoiceDate: Date, dueDate: Date, currentDate: Date = new Date()): number {
    const timeDiff = currentDate.getTime() - dueDate.getTime();
    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }

  getAgingCategory(agingDays: number): string {
    if (agingDays <= 0) return 'CURRENT';
    if (agingDays <= 30) return 'OVERDUE_1_30';
    if (agingDays <= 60) return 'OVERDUE_31_60';
    if (agingDays <= 90) return 'OVERDUE_61_90';
    return 'OVERDUE_90_PLUS';
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Document Management
  uploadInvoiceDocument(invoiceNumber: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('invoiceNumber', invoiceNumber);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });

    return this.http.post(
      `${this.apiUrl}/api/invoices/upload-document`,
      formData,
      { headers }
    );
  }

  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/api/documents/${documentId}/download`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  // Search Methods
  searchInvoices(vendorId: string, searchTerm: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(
      `${this.apiUrl}/api/invoices/search/vendor/${vendorId}?term=${searchTerm}`,
      { headers: this.getHeaders() }
    );
  }

  searchPayments(vendorId: string, searchTerm: string): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(
      `${this.apiUrl}/api/payments/search/vendor/${vendorId}?term=${searchTerm}`,
      { headers: this.getHeaders() }
    );
  }

  // Reporting Methods
  generateAgingReport(vendorId: string, format: 'PDF' | 'EXCEL'): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/api/reports/aging/vendor/${vendorId}?format=${format}`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  generateFinancialStatement(vendorId: string, dateFrom: Date, dateTo: Date): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/api/reports/financial-statement/vendor/${vendorId}?from=${dateFrom.toISOString()}&to=${dateTo.toISOString()}`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }
}
