import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Leave Type Interfaces
export interface LeaveType {
  code: string;
  name: string;
  description: string;
  maxDaysPerYear: number;
  carryForward: boolean;
  encashable: boolean;
  probationApplicable: boolean;
}

export interface LeaveBalance {
  leaveType: string;
  leaveTypeName: string;
  entitled: number;
  used: number;
  pending: number;
  remaining: number;
  carriedForward: number;
  lapsed: number;
  encashed: number;
  year: number;
}

export interface LeaveRequest {
  requestId: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  reason: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approverName?: string;
  approvedDate?: string;
  comments?: string;
  emergencyContact?: string;
  workHandover?: string;
  isHalfDay: boolean;
  halfDayType?: 'First Half' | 'Second Half';
  attachments?: string[];
}

export interface LeaveHistory {
  year: number;
  month: number;
  leaveType: string;
  leaveTypeName: string;
  fromDate: string;
  toDate: string;
  numberOfDays: number;
  status: string;
  reason: string;
  approver: string;
  appliedDate: string;
  approvedDate?: string;
}

export interface LeaveCalendar {
  date: string;
  leaveType?: string;
  leaveTypeName?: string;
  status: 'Present' | 'Leave' | 'Holiday' | 'Weekend';
  reason?: string;
  isHalfDay?: boolean;
}

export interface LeaveSummary {
  employeeId: string;
  year: number;
  totalLeavesTaken: number;
  totalLeaveDays: number;
  averageLeaveDuration: number;
  mostUsedLeaveType: string;
  longestLeaveStreak: number;
  leaveFrequency: { [month: string]: number };
  leavePattern: { [leaveType: string]: number };
}

export interface LeaveApprovalRequest {
  requestId: string;
  action: 'approve' | 'reject';
  comments?: string;
  approverId: string;
}

export interface LeaveReportFilter {
  employeeId?: string;
  department?: string;
  leaveType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  year?: number;
  month?: number;
}

export interface LeaveReportSort {
  field: 'appliedDate' | 'fromDate' | 'toDate' | 'status' | 'leaveType' | 'numberOfDays';
  direction: 'asc' | 'desc';
}

export interface LeaveReport {
  filters: LeaveReportFilter;
  sort: LeaveReportSort;
  data: LeaveRequest[];
  summary: {
    totalRecords: number;
    totalLeaveDays: number;
    statusBreakdown: { [status: string]: number };
    leaveTypeBreakdown: { [leaveType: string]: number };
    monthlyBreakdown: { [month: string]: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private apiUrl = `${environment.apiUrl}/api/employee`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Get all leave types available in SAP
  getLeaveTypes(): Observable<{ success: boolean; data: LeaveType[] }> {
    return this.http.get<{ success: boolean; data: LeaveType[] }>(
      `${this.apiUrl}/leave-types`,
      { headers: this.getHeaders() }
    );
  }

  // Get employee leave balance for current year
  getLeaveBalance(employeeId: string, year?: number): Observable<{ success: boolean; data: LeaveBalance[] }> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<{ success: boolean; data: LeaveBalance[] }>(
      `${this.apiUrl}/leave-balance/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Get complete leave history with filtering and sorting
  getLeaveHistory(
    employeeId: string, 
    filters?: LeaveReportFilter, 
    sort?: LeaveReportSort,
    page: number = 1,
    limit: number = 50
  ): Observable<{ success: boolean; data: LeaveReport }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    if (sort) {
      params = params.set('sortField', sort.field)
               .set('sortDirection', sort.direction);
    }

    return this.http.get<{ success: boolean; data: LeaveReport }>(
      `${this.apiUrl}/leave-history/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Get leave requests (pending/approved/rejected)
  getLeaveRequests(
    employeeId: string,
    status?: string,
    year?: number
  ): Observable<{ success: boolean; data: LeaveRequest[] }> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<{ success: boolean; data: LeaveRequest[] }>(
      `${this.apiUrl}/leave-requests/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Submit new leave request
  submitLeaveRequest(leaveRequest: Partial<LeaveRequest>): Observable<{ success: boolean; data: any; message: string }> {
    return this.http.post<{ success: boolean; data: any; message: string }>(
      `${this.apiUrl}/leave-request`,
      leaveRequest,
      { headers: this.getHeaders() }
    );
  }

  // Cancel leave request
  cancelLeaveRequest(requestId: string, reason: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/leave-request/${requestId}/cancel`,
      { reason },
      { headers: this.getHeaders() }
    );
  }

  // Get leave calendar for a specific month/year
  getLeaveCalendar(
    employeeId: string, 
    year: number, 
    month: number
  ): Observable<{ success: boolean; data: LeaveCalendar[] }> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<{ success: boolean; data: LeaveCalendar[] }>(
      `${this.apiUrl}/leave-calendar/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Get leave summary and analytics
  getLeaveSummary(
    employeeId: string, 
    year?: number
  ): Observable<{ success: boolean; data: LeaveSummary }> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<{ success: boolean; data: LeaveSummary }>(
      `${this.apiUrl}/leave-summary/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Export leave report to various formats
  exportLeaveReport(
    employeeId: string,
    format: 'pdf' | 'excel' | 'csv',
    filters?: LeaveReportFilter,
    sort?: LeaveReportSort
  ): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString());
        }
      });
    }

    if (sort) {
      params = params.set('sortField', sort.field)
               .set('sortDirection', sort.direction);
    }

    return this.http.get(
      `${this.apiUrl}/leave-report/${employeeId}/export`,
      { 
        headers: this.getHeaders(),
        params,
        responseType: 'blob'
      }
    );
  }

  // Get department-wise leave statistics (for managers)
  getDepartmentLeaveStats(
    department: string,
    year?: number
  ): Observable<{ success: boolean; data: any }> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }

    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/department-leave-stats/${department}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Get upcoming leaves (for planning)
  getUpcomingLeaves(
    employeeId: string,
    days: number = 30
  ): Observable<{ success: boolean; data: LeaveRequest[] }> {
    const params = new HttpParams().set('days', days.toString());

    return this.http.get<{ success: boolean; data: LeaveRequest[] }>(
      `${this.apiUrl}/upcoming-leaves/${employeeId}`,
      { headers: this.getHeaders(), params }
    );
  }

  // Approve/Reject leave request (for managers)
  processLeaveRequest(approval: LeaveApprovalRequest): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/leave-request/${approval.requestId}/process`,
      approval,
      { headers: this.getHeaders() }
    );
  }

  // Get leave policy details
  getLeavePolicy(): Observable<{ success: boolean; data: any }> {
    return this.http.get<{ success: boolean; data: any }>(
      `${this.apiUrl}/leave-policy`,
      { headers: this.getHeaders() }
    );
  }

  // Utility method to calculate working days between dates
  calculateWorkingDays(fromDate: string, toDate: string): Observable<{ success: boolean; data: { workingDays: number } }> {
    const params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);

    return this.http.get<{ success: boolean; data: { workingDays: number } }>(
      `${this.apiUrl}/calculate-working-days`,
      { headers: this.getHeaders(), params }
    );
  }
}
