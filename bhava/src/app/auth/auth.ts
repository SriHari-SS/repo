import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { VendorLoginRequest, VendorLoginResponse, VendorData } from '../models/vendor.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentVendorSubject = new BehaviorSubject<VendorData | null>(null);
  public currentVendor$ = this.currentVendorSubject.asObservable();
  private tokenKey = 'vendor_token';
  private vendorDataKey = 'vendor_data';

  constructor(private http: HttpClient) {
    // Check if vendor is already logged in
    this.loadStoredVendorData();
  }

  /**
   * Authenticate vendor with SAP ERP system
   * The vendor-ID and password are validated in the custom Z-table
   * after checking presence in standard table
   */
  login(loginRequest: VendorLoginRequest): Observable<VendorLoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<VendorLoginResponse>(`${environment.apiUrl}/auth/vendor/login`, loginRequest, { headers })
      .pipe(
        map(response => {
          if (response.success && response.token && response.vendorData) {
            // Store authentication data
            localStorage.setItem(this.tokenKey, response.token);
            localStorage.setItem(this.vendorDataKey, JSON.stringify(response.vendorData));
            this.currentVendorSubject.next(response.vendorData);
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  /**
   * Logout vendor and clear stored data
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.vendorDataKey);
    this.currentVendorSubject.next(null);
  }

  /**
   * Check if vendor is currently authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    return token !== null;
  }

  /**
   * Get current vendor data
   */
  getCurrentVendor(): VendorData | null {
    return this.currentVendorSubject.value;
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Load stored vendor data from localStorage
   */
  private loadStoredVendorData(): void {
    const storedVendorData = localStorage.getItem(this.vendorDataKey);
    if (storedVendorData && this.isAuthenticated()) {
      try {
        const vendorData: VendorData = JSON.parse(storedVendorData);
        this.currentVendorSubject.next(vendorData);
      } catch (error) {
        console.error('Error parsing stored vendor data:', error);
        this.logout();
      }
    }
  }

  /**
   * Validate vendor session with backend
   */
  validateSession(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<{ valid: boolean }>(`${environment.apiUrl}/auth/validate`, { headers })
      .pipe(
        map(response => response.valid),
        catchError(() => {
          this.logout();
          return new Observable<boolean>(observer => {
            observer.next(false);
            observer.complete();
          });
        })
      );
  }
}
