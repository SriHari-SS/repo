import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of } from 'rxjs';
import { LoginRequest, LoginResponse, Customer, ApiResponse } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:3000/api/auth';
  private readonly tokenKey = 'customer_token';
  private readonly customerKey = 'customer_data';
  
  private currentCustomerSubject = new BehaviorSubject<Customer | null>(this.getStoredCustomer());
  public currentCustomer$ = this.currentCustomerSubject.asObservable();
  
  public isAuthenticated = signal<boolean>(this.hasValidToken());

  constructor(private http: HttpClient) {
    // Check if token is still valid on service initialization
    this.verifyToken().subscribe();
  }

  /**
   * Authenticate customer with SAP system
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map(response => {
          if (response.success && response.token && response.customerData) {
            this.setAuthData(response.token, response.customerData);
            this.isAuthenticated.set(true);
            this.currentCustomerSubject.next(response.customerData);
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return of({
            success: false,
            message: error.error?.message || 'Login failed. Please try again.'
          });
        })
      );
  }

  /**
   * Logout customer
   */
  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        map(() => {
          this.clearAuthData();
          return { success: true };
        }),
        catchError(() => {
          // Even if logout request fails, clear local data
          this.clearAuthData();
          return of({ success: true });
        })
      );
  }

  /**
   * Verify token validity
   */
  verifyToken(): Observable<boolean> {
    if (!this.getToken()) {
      this.isAuthenticated.set(false);
      return of(false);
    }

    const headers = this.getAuthHeaders();
    
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/verify`, { headers })
      .pipe(
        map(response => {
          const isValid = response.success;
          this.isAuthenticated.set(isValid);
          
          if (!isValid) {
            this.clearAuthData();
          }
          
          return isValid;
        }),
        catchError(() => {
          this.isAuthenticated.set(false);
          this.clearAuthData();
          return of(false);
        })
      );
  }

  /**
   * Get current customer data
   */
  getCurrentCustomer(): Customer | null {
    return this.currentCustomerSubject.value;
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get authentication headers for API requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  /**
   * Check if user has a valid token
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    const customer = this.getStoredCustomer();
    return !!(token && customer);
  }

  /**
   * Store authentication data
   */
  private setAuthData(token: string, customer: Customer): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.customerKey, JSON.stringify(customer));
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.customerKey);
    this.isAuthenticated.set(false);
    this.currentCustomerSubject.next(null);
  }

  /**
   * Get stored customer data
   */
  private getStoredCustomer(): Customer | null {
    try {
      const customerData = localStorage.getItem(this.customerKey);
      return customerData ? JSON.parse(customerData) : null;
    } catch {
      return null;
    }
  }
}
