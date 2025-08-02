import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  RequestForQuotation, 
  PurchaseOrder, 
  GoodsReceipt, 
  BusinessTransactionSummary,
  RFQResponse,
  POResponse,
  GRResponse
} from '../models/business-transaction.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusinessTransactionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // RFQ Methods
  getRFQs(vendorId: string, status?: string, page: number = 1, pageSize: number = 10): Observable<RFQResponse> {
    let url = `${this.apiUrl}/api/rfq/vendor/${vendorId}?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<RFQResponse>(url, { headers: this.getHeaders() });
  }

  getRFQById(rfqNumber: string): Observable<RequestForQuotation> {
    return this.http.get<RequestForQuotation>(
      `${this.apiUrl}/api/rfq/${rfqNumber}`, 
      { headers: this.getHeaders() }
    );
  }

  submitQuotation(rfqNumber: string, quotationData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/rfq/${rfqNumber}/submit-quotation`,
      quotationData,
      { headers: this.getHeaders() }
    );
  }

  // Purchase Order Methods
  getPurchaseOrders(vendorId: string, status?: string, page: number = 1, pageSize: number = 10): Observable<POResponse> {
    let url = `${this.apiUrl}/api/po/vendor/${vendorId}?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<POResponse>(url, { headers: this.getHeaders() });
  }

  getPOById(poNumber: string): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(
      `${this.apiUrl}/api/po/${poNumber}`, 
      { headers: this.getHeaders() }
    );
  }

  acknowledgePO(poNumber: string, acknowledgment: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/po/${poNumber}/acknowledge`,
      acknowledgment,
      { headers: this.getHeaders() }
    );
  }

  updateDeliveryDate(poNumber: string, itemNumber: string, newDeliveryDate: Date): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/po/${poNumber}/item/${itemNumber}/delivery-date`,
      { deliveryDate: newDeliveryDate },
      { headers: this.getHeaders() }
    );
  }

  // Goods Receipt Methods
  getGoodsReceipts(vendorId: string, status?: string, page: number = 1, pageSize: number = 10): Observable<GRResponse> {
    let url = `${this.apiUrl}/api/gr/vendor/${vendorId}?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get<GRResponse>(url, { headers: this.getHeaders() });
  }

  getGRById(grNumber: string): Observable<GoodsReceipt> {
    return this.http.get<GoodsReceipt>(
      `${this.apiUrl}/api/gr/${grNumber}`, 
      { headers: this.getHeaders() }
    );
  }

  getGRByPO(poNumber: string): Observable<GoodsReceipt[]> {
    return this.http.get<GoodsReceipt[]>(
      `${this.apiUrl}/api/gr/po/${poNumber}`, 
      { headers: this.getHeaders() }
    );
  }

  createASN(poNumber: string, asnData: any): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/api/asn/${poNumber}`,
      asnData,
      { headers: this.getHeaders() }
    );
  }

  // Summary Dashboard Data
  getBusinessTransactionSummary(vendorId: string): Observable<BusinessTransactionSummary> {
    return this.http.get<BusinessTransactionSummary>(
      `${this.apiUrl}/api/summary/vendor/${vendorId}`, 
      { headers: this.getHeaders() }
    );
  }

  // Search and Filter Methods
  searchTransactions(vendorId: string, searchTerm: string, type: 'RFQ' | 'PO' | 'GR'): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/search/vendor/${vendorId}?term=${searchTerm}&type=${type}`,
      { headers: this.getHeaders() }
    );
  }

  getTransactionsByDateRange(
    vendorId: string, 
    startDate: Date, 
    endDate: Date, 
    type: 'RFQ' | 'PO' | 'GR'
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/transactions/vendor/${vendorId}/date-range?start=${startDate.toISOString()}&end=${endDate.toISOString()}&type=${type}`,
      { headers: this.getHeaders() }
    );
  }

  // Document Download
  downloadDocument(documentId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/api/documents/${documentId}/download`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }

  // Notification Methods
  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/notifications/${notificationId}/read`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getUnreadNotifications(vendorId: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/api/notifications/vendor/${vendorId}/unread`,
      { headers: this.getHeaders() }
    );
  }
}
