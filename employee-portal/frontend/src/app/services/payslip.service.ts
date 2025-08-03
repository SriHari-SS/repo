import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Pay Slip Interfaces
export interface PaySlipRequest {
  employeeId: string;
  month: number;
  year: number;
}

export interface PaySlipBasicInfo {
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  costCenter: string;
  location: string;
  bankAccount: string;
  panNumber: string;
  pfNumber: string;
  esiNumber: string;
  joiningDate: string;
  payPeriod: string;
  payDate: string;
  workingDays: number;
  leaveDays: number;
  paidDays: number;
}

export interface EarningsComponent {
  code: string;
  description: string;
  amount: number;
  type: 'Fixed' | 'Variable' | 'Allowance' | 'Overtime' | 'Bonus';
  isTaxable: boolean;
  isPfApplicable: boolean;
  isEsiApplicable: boolean;
}

export interface DeductionComponent {
  code: string;
  description: string;
  amount: number;
  type: 'Statutory' | 'Voluntary' | 'Loan' | 'Advance' | 'Tax';
  isPreTax: boolean;
}

export interface TaxDetails {
  grossSalary: number;
  taxableIncome: number;
  incomeTax: number;
  professionalTax: number;
  tdsAmount: number;
  taxSavingInvestments: number;
  exemptAllowances: number;
}

export interface StatutoryDetails {
  pfEmployeeContribution: number;
  pfEmployerContribution: number;
  esiEmployeeContribution: number;
  esiEmployerContribution: number;
  gratuity: number;
  lwf: number;
}

export interface YtdSummary {
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  incomeTax: number;
  pfContribution: number;
  esiContribution: number;
  professionalTax: number;
}

export interface PaySlipData {
  basicInfo: PaySlipBasicInfo;
  earnings: EarningsComponent[];
  deductions: DeductionComponent[];
  taxDetails: TaxDetails;
  statutoryDetails: StatutoryDetails;
  ytdSummary: YtdSummary;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  netPayInWords: string;
  companyInfo: {
    name: string;
    address: string;
    logo: string;
  };
  generatedOn: string;
}

export interface PaySlipHistory {
  month: number;
  year: number;
  payPeriod: string;
  netPay: number;
  status: 'Processed' | 'Draft' | 'Approved' | 'Published';
  generatedDate: string;
  downloadUrl?: string;
}

export interface PaySlipEmailRequest {
  employeeId: string;
  month: number;
  year: number;
  emailAddress: string;
  subject?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PayslipService {
  private apiUrl = `${environment.apiUrl}/api/employee`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get pay slip data from SAP for specific month and year
  getPaySlip(employeeId: string, month: number, year: number): Observable<{ success: boolean; data: PaySlipData }> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<{ success: boolean; data: PaySlipData }>(
      `${this.apiUrl}/payslip/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Get pay slip history for an employee
  getPaySlipHistory(
    employeeId: string, 
    year?: number,
    limit: number = 12
  ): Observable<{ success: boolean; data: PaySlipHistory[] }> {
    let params = new HttpParams().set('limit', limit.toString());
    
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<{ success: boolean; data: PaySlipHistory[] }>(
      `${this.apiUrl}/payslip-history/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Download pay slip as PDF
  downloadPaySlipPDF(employeeId: string, month: number, year: number): Observable<Blob> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString())
      .set('format', 'pdf');

    return this.http.get(
      `${this.apiUrl}/payslip/${employeeId}/download`,
      { 
        headers: this.getHeaders(),
        params,
        responseType: 'blob'
      }
    );
  }

  // Email pay slip to employee or specified email
  emailPaySlip(request: PaySlipEmailRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiUrl}/payslip/email`,
      request,
      { headers: this.getHeaders() }
    );
  }

  // Get available pay periods for an employee
  getAvailablePayPeriods(employeeId: string): Observable<{ success: boolean; data: { month: number; year: number; period: string }[] }> {
    return this.http.get<{ success: boolean; data: { month: number; year: number; period: string }[] }>(
      `${this.apiUrl}/payslip-periods/${employeeId}`,
      { headers: this.getHeaders() }
    );
  }

  // Get pay slip summary for dashboard
  getPaySlipSummary(employeeId: string, year: number): Observable<{ success: boolean; data: any }> {
    const params = new HttpParams().set('year', year.toString());

    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/payslip-summary/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Verify pay slip access permissions
  verifyPaySlipAccess(employeeId: string, month: number, year: number): Observable<{ success: boolean; canAccess: boolean; reason?: string }> {
    const params = new HttpParams()
      .set('month', month.toString())
      .set('year', year.toString());

    return this.http.get<{ success: boolean; canAccess: boolean; reason?: string }>(
      `${this.apiUrl}/payslip-access/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Get tax computation details
  getTaxComputation(employeeId: string, year: number): Observable<{ success: boolean; data: any }> {
    const params = new HttpParams().set('year', year.toString());

    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/tax-computation/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Get Form 16 data
  getForm16(employeeId: string, year: number): Observable<{ success: boolean; data: any }> {
    const params = new HttpParams().set('year', year.toString());

    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/form16/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Download Form 16 as PDF
  downloadForm16PDF(employeeId: string, year: number): Observable<Blob> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('format', 'pdf');

    return this.http.get(
      `${this.apiUrl}/form16/${employeeId}/download`,
      { 
        headers: this.getHeaders(),
        params,
        responseType: 'blob'
      }
    );
  }

  // Utility method to format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // Utility method to convert amount to words
  convertAmountToWords(amount: number): string {
    // This would typically call a backend service or use a library
    // For now, returning a placeholder
    return `Rupees ${amount.toLocaleString('en-IN')} only`;
  }

  // Get month name from number
  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || '';
  }
}
