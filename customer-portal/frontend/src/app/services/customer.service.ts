import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiResponse, DashboardData, CustomerProfile, Order, Inquiry, SalesOrder, Delivery } from '../models/customer.model';
import { Invoice, Payment, CreditDebitMemo, AgingBucket, FinancialSummary } from '../components/financial-sheet/financial-sheet.component';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly apiUrl = 'http://localhost:3000/api/customer';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get customer dashboard data
   */
  getDashboard(): Observable<ApiResponse<DashboardData>> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.get<ApiResponse<DashboardData>>(`${this.apiUrl}/dashboard`, { headers })
      .pipe(
        catchError(error => {
          console.error('Dashboard error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to load dashboard data'
          });
        })
      );
  }

  /**
   * Get customer profile information
   */
  getProfile(): Observable<ApiResponse<CustomerProfile>> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.get<ApiResponse<CustomerProfile>>(`${this.apiUrl}/profile`, { headers })
      .pipe(
        catchError(error => {
          console.error('Profile error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to load profile data'
          });
        })
      );
  }

  /**
   * Get customer inquiries
   */
  getInquiries(page: number = 1, limit: number = 10, status?: string): Observable<ApiResponse<Inquiry[]>> {
    const headers = this.authService.getAuthHeaders();
    let params = `page=${page}&limit=${limit}`;
    
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<Inquiry[]>>(`${this.apiUrl}/inquiries?${params}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Inquiries error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to load inquiries'
          });
        })
      );
  }

  /**
   * Get customer sales orders
   */
  getSalesOrders(page: number = 1, limit: number = 10, status?: string): Observable<ApiResponse<SalesOrder[]>> {
    const headers = this.authService.getAuthHeaders();
    let params = `page=${page}&limit=${limit}`;
    
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<SalesOrder[]>>(`${this.apiUrl}/sales-orders?${params}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Sales Orders error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to load sales orders'
          });
        })
      );
  }

  /**
   * Get customer deliveries
   */
  getDeliveries(page: number = 1, limit: number = 10, status?: string): Observable<ApiResponse<Delivery[]>> {
    const headers = this.authService.getAuthHeaders();
    let params = `page=${page}&limit=${limit}`;
    
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<Delivery[]>>(`${this.apiUrl}/deliveries?${params}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Deliveries error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to load deliveries'
          });
        })
      );
  }

  /**
   * Get customer orders (legacy method for backward compatibility)
   */
  getOrders(page: number = 1, limit: number = 10, status?: string): Observable<ApiResponse<Order[]>> {
    const headers = this.authService.getAuthHeaders();
    let params = `page=${page}&limit=${limit}`;
    
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<ApiResponse<Order[]>>(`${this.apiUrl}/orders?${params}`, { headers })
      .pipe(
        catchError(error => {
          console.error('Orders error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Failed to load orders'
          });
        })
      );
  }

  // Financial Sheet Methods

  /**
   * Get customer invoices
   */
  async getInvoices(): Promise<Invoice[]> {
    const headers = this.authService.getAuthHeaders();
    
    try {
      const response = await this.http.get<ApiResponse<Invoice[]>>(`${this.apiUrl}/financial/invoices`, { headers }).toPromise();
      return response?.data || [];
    } catch (error) {
      console.error('Invoices error:', error);
      return [];
    }
  }

  /**
   * Get customer payments
   */
  async getPayments(): Promise<Payment[]> {
    const headers = this.authService.getAuthHeaders();
    
    try {
      const response = await this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/financial/payments`, { headers }).toPromise();
      return response?.data || [];
    } catch (error) {
      console.error('Payments error:', error);
      return [];
    }
  }

  /**
   * Get credit and debit memos
   */
  async getCreditDebitMemos(): Promise<CreditDebitMemo[]> {
    const headers = this.authService.getAuthHeaders();
    
    try {
      const response = await this.http.get<ApiResponse<CreditDebitMemo[]>>(`${this.apiUrl}/financial/memos`, { headers }).toPromise();
      return response?.data || [];
    } catch (error) {
      console.error('Credit/Debit memos error:', error);
      return [];
    }
  }

  /**
   * Get aging report
   */
  async getAgingReport(): Promise<AgingBucket[]> {
    const headers = this.authService.getAuthHeaders();
    
    try {
      const response = await this.http.get<ApiResponse<AgingBucket[]>>(`${this.apiUrl}/financial/aging`, { headers }).toPromise();
      return response?.data || [];
    } catch (error) {
      console.error('Aging report error:', error);
      return [];
    }
  }

  /**
   * Get financial summary
   */
  async getFinancialSummary(): Promise<FinancialSummary> {
    const headers = this.authService.getAuthHeaders();
    
    try {
      const response = await this.http.get<ApiResponse<FinancialSummary>>(`${this.apiUrl}/financial/summary`, { headers }).toPromise();
      return response?.data || {
        totalInvoiced: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        totalCreditMemos: 0,
        totalDebitMemos: 0,
        averagePaymentDays: 0,
        currency: 'INR'
      };
    } catch (error) {
      console.error('Financial summary error:', error);
      return {
        totalInvoiced: 0,
        totalPaid: 0,
        totalOutstanding: 0,
        totalCreditMemos: 0,
        totalDebitMemos: 0,
        averagePaymentDays: 0,
        currency: 'INR'
      };
    }
  }
}
