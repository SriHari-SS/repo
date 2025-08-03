import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PayslipService, PaySlipData, PaySlipHistory, PaySlipEmailRequest } from '../../services/payslip.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.scss']
})
export class PayslipComponent implements OnInit {
  employeeId: string = '';
  paySlipData: PaySlipData | null = null;
  paySlipHistory: PaySlipHistory[] = [];
  availablePeriods: { month: number; year: number; period: string }[] = [];
  
  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  
  loading = false;
  error: string | null = null;
  showEmailModal = false;
  showHistoryModal = false;
  
  emailForm: FormGroup;
  
  // Current view state
  currentView: 'viewer' | 'history' | 'selection' = 'selection';
  
  constructor(
    private payslipService: PayslipService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {
    this.emailForm = this.formBuilder.group({
      emailAddress: ['', [Validators.required, Validators.email]],
      subject: ['Pay Slip - {{month}} {{year}}'],
      message: ['Please find attached your pay slip for {{month}} {{year}}.']
    });
  }

  ngOnInit(): void {
    // Get employee ID from route or current user
    this.route.params.subscribe(params => {
      const currentEmployee = this.authService.getCurrentEmployee();
      this.employeeId = params['employeeId'] || currentEmployee?.employeeId || '';
      this.initializeComponent();
    });
  }

  async initializeComponent(): Promise<void> {
    if (!this.employeeId) {
      this.error = 'Employee ID not found';
      return;
    }

    try {
      await this.loadAvailablePeriods();
      await this.loadPaySlipHistory();
      
      // Set default to current month if available
      const currentPeriod = this.availablePeriods.find(p => 
        p.month === this.selectedMonth && p.year === this.selectedYear
      );
      
      if (currentPeriod) {
        await this.loadPaySlip(this.selectedMonth, this.selectedYear);
        this.currentView = 'viewer';
      } else {
        this.currentView = 'selection';
      }
    } catch (error) {
      console.error('Error initializing pay slip component:', error);
      this.error = 'Failed to load pay slip data';
    }
  }

  async loadAvailablePeriods(): Promise<void> {
    try {
      const response = await this.payslipService.getAvailablePayPeriods(this.employeeId).toPromise();
      if (response?.success) {
        this.availablePeriods = response.data;
      }
    } catch (error) {
      console.error('Error loading available periods:', error);
    }
  }

  async loadPaySlipHistory(): Promise<void> {
    try {
      const response = await this.payslipService.getPaySlipHistory(this.employeeId, this.selectedYear).toPromise();
      if (response?.success) {
        this.paySlipHistory = response.data;
      }
    } catch (error) {
      console.error('Error loading pay slip history:', error);
    }
  }

  async loadPaySlip(month: number, year: number): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // First verify access
      const accessResponse = await this.payslipService.verifyPaySlipAccess(this.employeeId, month, year).toPromise();
      
      if (!accessResponse?.success || !accessResponse.canAccess) {
        this.error = accessResponse?.reason || 'Access denied to pay slip';
        this.loading = false;
        return;
      }

      // Load pay slip data
      const response = await this.payslipService.getPaySlip(this.employeeId, month, year).toPromise();
      
      if (response?.success) {
        this.paySlipData = response.data;
        this.selectedMonth = month;
        this.selectedYear = year;
        this.currentView = 'viewer';
      } else {
        this.error = 'Pay slip not found for selected period';
      }
    } catch (error) {
      console.error('Error loading pay slip:', error);
      this.error = 'Failed to load pay slip data';
    } finally {
      this.loading = false;
    }
  }

  selectPayPeriod(month: number, year: number): void {
    this.loadPaySlip(month, year);
  }

  downloadPDF(): void {
    if (!this.paySlipData) return;

    this.loading = true;
    this.payslipService.downloadPaySlipPDF(this.employeeId, this.selectedMonth, this.selectedYear)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `PaySlip_${this.employeeId}_${this.getMonthName(this.selectedMonth)}_${this.selectedYear}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error downloading PDF:', error);
          this.error = 'Failed to download pay slip PDF';
          this.loading = false;
        }
      });
  }

  printPaySlip(): void {
    window.print();
  }

  openEmailModal(): void {
    if (this.paySlipData) {
      const monthName = this.getMonthName(this.selectedMonth);
      this.emailForm.patchValue({
        emailAddress: this.paySlipData.basicInfo.employeeId + '@company.com', // Default email
        subject: `Pay Slip - ${monthName} ${this.selectedYear}`,
        message: `Please find attached your pay slip for ${monthName} ${this.selectedYear}.`
      });
      this.showEmailModal = true;
    }
  }

  closeEmailModal(): void {
    this.showEmailModal = false;
    this.emailForm.reset();
  }

  sendEmail(): void {
    if (this.emailForm.valid) {
      const emailRequest: PaySlipEmailRequest = {
        employeeId: this.employeeId,
        month: this.selectedMonth,
        year: this.selectedYear,
        emailAddress: this.emailForm.value.emailAddress,
        subject: this.emailForm.value.subject,
        message: this.emailForm.value.message
      };

      this.loading = true;
      this.payslipService.emailPaySlip(emailRequest).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Pay slip emailed successfully!');
            this.closeEmailModal();
          } else {
            this.error = 'Failed to send email';
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error sending email:', error);
          this.error = 'Failed to send email';
          this.loading = false;
        }
      });
    }
  }

  openHistoryModal(): void {
    this.showHistoryModal = true;
  }

  closeHistoryModal(): void {
    this.showHistoryModal = false;
  }

  loadHistoryPaySlip(history: PaySlipHistory): void {
    this.loadPaySlip(history.month, history.year);
    this.closeHistoryModal();
  }

  goBackToSelection(): void {
    this.currentView = 'selection';
    this.paySlipData = null;
  }

  getMonthName(month: number): string {
    return this.payslipService.getMonthName(month);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'processed': return 'status-processed';
      case 'approved': return 'status-approved';
      case 'published': return 'status-published';
      case 'draft': return 'status-draft';
      default: return 'status-default';
    }
  }

  formatCurrency(amount: number): string {
    return this.payslipService.formatCurrency(amount);
  }

  // Navigation methods
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile', this.employeeId]);
  }
}
