import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { VendorProfile, VendorProfileResponse, ApiResponse } from '../models/vendor.model';
import { environment } from '../../environments/environment';
import { AuthService } from '../auth/auth';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private vendorProfileSubject = new BehaviorSubject<VendorProfile | null>(null);
  public vendorProfile$ = this.vendorProfileSubject.asObservable();
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Fetch vendor profile from SAP ERP system
   * Makes synchronous call to SAP via web service
   */
  getVendorProfile(vendorId: string): Observable<VendorProfileResponse> {
    this.isLoadingSubject.next(true);
    
    const headers = this.getAuthHeaders();
    
    return this.http.get<VendorProfileResponse>(`${environment.apiUrl}/vendor/profile/${vendorId}`, { headers })
      .pipe(
        map(response => {
          this.isLoadingSubject.next(false);
          if (response.success && response.vendorProfile) {
            this.vendorProfileSubject.next(response.vendorProfile);
          }
          return response;
        }),
        catchError(error => {
          this.isLoadingSubject.next(false);
          console.error('Error fetching vendor profile:', error);
          throw error;
        })
      );
  }

  /**
   * Refresh vendor profile data from SAP
   * Forces a fresh sync with SAP ERP system
   */
  refreshVendorProfile(vendorId: string): Observable<VendorProfileResponse> {
    this.isLoadingSubject.next(true);
    
    const headers = this.getAuthHeaders();
    
    return this.http.post<VendorProfileResponse>(`${environment.apiUrl}/vendor/profile/${vendorId}/refresh`, {}, { headers })
      .pipe(
        map(response => {
          this.isLoadingSubject.next(false);
          if (response.success && response.vendorProfile) {
            this.vendorProfileSubject.next(response.vendorProfile);
          }
          return response;
        }),
        catchError(error => {
          this.isLoadingSubject.next(false);
          console.error('Error refreshing vendor profile:', error);
          throw error;
        })
      );
  }

  /**
   * Update vendor profile information
   * Sends updates back to SAP ERP system
   */
  updateVendorProfile(vendorId: string, updates: Partial<VendorProfile>): Observable<ApiResponse<VendorProfile>> {
    this.isLoadingSubject.next(true);
    
    const headers = this.getAuthHeaders();
    
    return this.http.put<ApiResponse<VendorProfile>>(`${environment.apiUrl}/vendor/profile/${vendorId}`, updates, { headers })
      .pipe(
        map(response => {
          this.isLoadingSubject.next(false);
          if (response.success && response.data) {
            this.vendorProfileSubject.next(response.data);
          }
          return response;
        }),
        catchError(error => {
          this.isLoadingSubject.next(false);
          console.error('Error updating vendor profile:', error);
          throw error;
        })
      );
  }

  /**
   * Get vendor documents
   */
  getVendorDocuments(vendorId: string): Observable<ApiResponse<any[]>> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/vendor/${vendorId}/documents`, { headers })
      .pipe(
        catchError(error => {
          console.error('Error fetching vendor documents:', error);
          throw error;
        })
      );
  }

  /**
   * Upload vendor document
   */
  uploadDocument(vendorId: string, file: File, documentType: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
    
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/vendor/${vendorId}/documents`, formData, { headers })
      .pipe(
        catchError(error => {
          console.error('Error uploading document:', error);
          throw error;
        })
      );
  }

  /**
   * Get current vendor profile from subject
   */
  getCurrentVendorProfile(): VendorProfile | null {
    return this.vendorProfileSubject.value;
  }

  /**
   * Clear vendor profile data
   */
  clearVendorProfile(): void {
    this.vendorProfileSubject.next(null);
  }

  /**
   * Get authentication headers for API calls
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Format address for display
   */
  formatAddress(address: any): string {
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  }

  /**
   * Get primary address
   */
  getPrimaryAddress(addresses: any[]): any | null {
    return addresses.find(addr => addr.isPrimary) || addresses[0] || null;
  }

  /**
   * Get primary bank account
   */
  getPrimaryBankAccount(bankDetails: any[]): any | null {
    return bankDetails.find(bank => bank.isPrimary) || bankDetails[0] || null;
  }
}
