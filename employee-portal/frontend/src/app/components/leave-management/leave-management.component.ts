import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  LeaveService, 
  LeaveBalance, 
  LeaveRequest, 
  LeaveHistory, 
  LeaveSummary,
  LeaveReportFilter,
  LeaveReportSort,
  LeaveReport,
  LeaveType
} from '../../services/leave.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './leave-management.component.html',
  styleUrls: ['./leave-management.component.scss']
})
export class LeaveManagementComponent implements OnInit {
  // Expose global objects to template
  Math = Math;
  Object = Object;
  
  // Component State
  loading = false;
  error = '';
  currentEmployeeId = '';
  currentYear = new Date().getFullYear();
  
  // Active Tab
  activeTab: 'dashboard' | 'history' | 'requests' | 'calendar' | 'reports' = 'dashboard';
  
  // Data Properties
  leaveBalance: LeaveBalance[] = [];
  leaveTypes: LeaveType[] = [];
  leaveRequests: LeaveRequest[] = [];
  leaveHistory: LeaveHistory[] = [];
  leaveSummary: LeaveSummary | null = null;
  leaveReport: LeaveReport | null = null;
  
  // Filter and Sort
  reportFilters: LeaveReportFilter = {};
  reportSort: LeaveReportSort = { field: 'appliedDate', direction: 'desc' };
  filterForm: FormGroup;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 20;
  totalItems = 0;
  
  // UI State
  showFilters = false;
  selectedRequests: string[] = [];
  exportFormat: 'pdf' | 'excel' | 'csv' = 'excel';
  
  // Calendar
  calendarData: any[] = [];
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  constructor(
    private leaveService: LeaveService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    // Get employee ID from auth service or route params
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.currentEmployeeId = this.route.snapshot.params['employeeId'] || payload.employeeId || '';
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
    
    if (!this.currentEmployeeId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.initializeData();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      leaveType: [''],
      status: [''],
      fromDate: [''],
      toDate: [''],
      year: [this.currentYear],
      month: ['']
    });
  }

  async initializeData(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      // Load initial data based on active tab
      await Promise.all([
        this.loadLeaveTypes(),
        this.loadLeaveBalance(),
        this.loadLeaveSummary()
      ]);

      // Load tab-specific data
      switch (this.activeTab) {
        case 'dashboard':
          await this.loadDashboardData();
          break;
        case 'history':
          await this.loadLeaveHistory();
          break;
        case 'requests':
          await this.loadLeaveRequests();
          break;
        case 'calendar':
          await this.loadLeaveCalendar();
          break;
        case 'reports':
          await this.loadLeaveReport();
          break;
      }
    } catch (error) {
      console.error('Error loading leave data:', error);
      this.error = 'Failed to load leave data. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  private async loadLeaveTypes(): Promise<void> {
    try {
      const response = await this.leaveService.getLeaveTypes().toPromise();
      if (response?.success) {
        this.leaveTypes = response.data;
      }
    } catch (error) {
      console.error('Error loading leave types:', error);
    }
  }

  private async loadLeaveBalance(): Promise<void> {
    try {
      const response = await this.leaveService.getLeaveBalance(this.currentEmployeeId, this.currentYear).toPromise();
      if (response?.success) {
        this.leaveBalance = response.data;
      }
    } catch (error) {
      console.error('Error loading leave balance:', error);
    }
  }

  private async loadLeaveSummary(): Promise<void> {
    try {
      const response = await this.leaveService.getLeaveSummary(this.currentEmployeeId, this.currentYear).toPromise();
      if (response?.success) {
        this.leaveSummary = response.data;
      }
    } catch (error) {
      console.error('Error loading leave summary:', error);
    }
  }

  private async loadDashboardData(): Promise<void> {
    // Dashboard combines multiple data sources - already loaded in initializeData
  }

  private async loadLeaveHistory(): Promise<void> {
    try {
      const response = await this.leaveService.getLeaveHistory(
        this.currentEmployeeId, 
        this.reportFilters, 
        this.reportSort,
        this.currentPage,
        this.itemsPerPage
      ).toPromise();
      
      if (response?.success) {
        this.leaveReport = response.data;
        // Convert LeaveRequest to LeaveHistory format for display
        this.leaveHistory = response.data.data.map(req => ({
          year: new Date(req.fromDate).getFullYear(),
          month: new Date(req.fromDate).getMonth() + 1,
          leaveType: req.leaveType,
          leaveTypeName: req.leaveTypeName,
          fromDate: req.fromDate,
          toDate: req.toDate,
          numberOfDays: req.numberOfDays,
          status: req.status,
          reason: req.reason,
          approver: req.approverName || 'N/A',
          appliedDate: req.appliedDate,
          approvedDate: req.approvedDate
        }));
        this.totalItems = response.data.summary.totalRecords;
      }
    } catch (error) {
      console.error('Error loading leave history:', error);
    }
  }

  private async loadLeaveRequests(): Promise<void> {
    try {
      const response = await this.leaveService.getLeaveRequests(this.currentEmployeeId).toPromise();
      if (response?.success) {
        this.leaveRequests = response.data;
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
    }
  }

  private async loadLeaveCalendar(): Promise<void> {
    try {
      const response = await this.leaveService.getLeaveCalendar(
        this.currentEmployeeId, 
        this.selectedYear, 
        this.selectedMonth
      ).toPromise();
      if (response?.success) {
        this.calendarData = response.data;
      }
    } catch (error) {
      console.error('Error loading leave calendar:', error);
    }
  }

  private async loadLeaveReport(): Promise<void> {
    await this.loadLeaveHistory(); // Reports use the same data as history
  }

  // Tab Navigation
  switchTab(tab: 'dashboard' | 'history' | 'requests' | 'calendar' | 'reports'): void {
    this.activeTab = tab;
    this.initializeData();
  }

  // Filter Methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    const formValues = this.filterForm.value;
    this.reportFilters = {
      ...formValues,
      employeeId: this.currentEmployeeId
    };
    
    // Remove empty values
    Object.keys(this.reportFilters).forEach(key => {
      if (this.reportFilters[key as keyof LeaveReportFilter] === '' || 
          this.reportFilters[key as keyof LeaveReportFilter] === null) {
        delete this.reportFilters[key as keyof LeaveReportFilter];
      }
    });

    this.currentPage = 1;
    this.loadLeaveHistory();
  }

  clearFilters(): void {
    this.filterForm.reset({
      leaveType: '',
      status: '',
      fromDate: '',
      toDate: '',
      year: this.currentYear,
      month: ''
    });
    this.reportFilters = {};
    this.currentPage = 1;
    this.loadLeaveHistory();
  }

  // Sort Methods
  sortBy(field: LeaveReportSort['field']): void {
    if (this.reportSort.field === field) {
      this.reportSort.direction = this.reportSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.reportSort.field = field;
      this.reportSort.direction = 'desc';
    }
    
    this.currentPage = 1;
    this.loadLeaveHistory();
  }

  getSortIcon(field: string): string {
    if (this.reportSort.field !== field) return '⚪';
    return this.reportSort.direction === 'asc' ? '🔼' : '🔽';
  }

  // Pagination Methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.loadLeaveHistory();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Export Methods
  async exportReport(): Promise<void> {
    try {
      this.loading = true;
      const blob = await this.leaveService.exportLeaveReport(
        this.currentEmployeeId,
        this.exportFormat,
        this.reportFilters,
        this.reportSort
      ).toPromise();

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leave-report-${this.currentEmployeeId}-${new Date().toISOString().split('T')[0]}.${this.exportFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      this.error = 'Failed to export report. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  // Utility Methods
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-danger';
      case 'cancelled': return 'badge-secondary';
      default: return 'badge-primary';
    }
  }

  getLeaveTypeColor(leaveType: string): string {
    const colors: { [key: string]: string } = {
      'annual': '#14b8a6',
      'sick': '#f59e0b',
      'casual': '#06b6d4',
      'maternity': '#ec4899',
      'paternity': '#8b5cf6',
      'emergency': '#ef4444'
    };
    return colors[leaveType?.toLowerCase()] || '#6b7280';
  }

  calculateLeavePercentage(balance: LeaveBalance): number {
    if (balance.entitled === 0) return 0;
    return Math.round((balance.used / balance.entitled) * 100);
  }

  getBalanceStatusClass(balance: LeaveBalance): string {
    const percentage = this.calculateLeavePercentage(balance);
    if (percentage >= 80) return 'status-high';
    if (percentage >= 60) return 'status-medium';
    return 'status-low';
  }

  // Navigation Methods
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  refreshData(): void {
    this.initializeData();
  }

  // Calendar Navigation
  previousMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadLeaveCalendar();
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadLeaveCalendar();
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  // Cancel Leave Request
  cancelLeaveRequest(requestId: string, reason: string): void {
    if (!requestId) return;
    
    this.loading = true;
    this.leaveService.cancelLeaveRequest(requestId, reason).subscribe({
      next: (response) => {
        if (response.success) {
          // Refresh the leave requests data
          this.loadLeaveRequests();
          this.loadLeaveHistory();
          this.loadLeaveBalance();
        } else {
          this.error = 'Failed to cancel leave request';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cancelling leave request:', error);
        this.error = 'Error cancelling leave request. Please try again.';
        this.loading = false;
      }
    });
  }
}
