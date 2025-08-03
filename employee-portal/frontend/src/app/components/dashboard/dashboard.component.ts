import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, Employee } from '../../services/auth.service';

interface TeamMember {
  name: string;
  role: string;
  avatar?: string;
}

interface LeaveApplication {
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending' | 'rejected';
  type: string;
}

interface Project {
  name: string;
  client: string;
  progress: number;
  status: 'active' | 'completed' | 'onhold';
}

interface Activity {
  type: 'leave' | 'payslip' | 'project' | 'attendance' | 'system';
  message: string;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  employee: Employee | null = null;
  currentTime = new Date();

  // Header Navigation Properties
  searchQuery = '';
  notifications = 3;
  showUserMenu = false;

  // Dashboard Data
  leaveBalance = 18;
  pendingTasks = 5;
  currentProject = 'ERP Module';
  yearsOfService = 3;
  managerName = 'Sarah Johnson';

  // Leave Management Data
  annualLeaveTotal = 25;
  annualLeaveUsed = 7;
  sickLeaveTotal = 12;
  sickLeaveUsed = 3;

  recentLeaves: LeaveApplication[] = [
    { startDate: '2025-07-15', endDate: '2025-07-17', status: 'approved', type: 'Annual' },
    { startDate: '2025-06-28', endDate: '2025-06-30', status: 'approved', type: 'Sick' },
    { startDate: '2025-08-10', endDate: '2025-08-12', status: 'pending', type: 'Annual' }
  ];

  // Salary Data
  currentSalary = 85000;
  basicSalary = 50000;
  allowances = 25000;
  deductions = 10000;

  // Team and Organization
  teamMembers: TeamMember[] = [
    { name: 'John Smith', role: 'Junior Developer' },
    { name: 'Emma Wilson', role: 'Business Analyst' }
  ];

  // Projects Data
  currentProjects: Project[] = [
    { name: 'SAP Integration Module', client: 'Internal', progress: 75, status: 'active' },
    { name: 'Employee Portal Enhancement', client: 'HR Department', progress: 60, status: 'active' },
    { name: 'Payroll System Upgrade', client: 'Finance', progress: 90, status: 'active' }
  ];

  // Performance Data
  performanceScore = 4.2;
  tasksCompleted = 47;

  // Recent Activity
  recentActivity: Activity[] = [
    {
      type: 'payslip',
      message: 'July 2025 payslip generated and available for download',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'leave',
      message: 'Leave application for Aug 10-12 submitted for approval',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'project',
      message: 'SAP Integration Module milestone completed',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      type: 'attendance',
      message: 'Monthly attendance summary available',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check authentication
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current employee data
    this.employee = this.authService.getCurrentEmployee();

    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    // Simulate real-time data updates
    this.initializeRealTimeUpdates();
  }

  /**
   * Initialize real-time data updates
   */
  private initializeRealTimeUpdates(): void {
    // Simulate periodic data refresh every 30 seconds
    setInterval(() => {
      this.refreshDashboardData();
    }, 30000);
  }

  /**
   * Refresh dashboard data from SAP
   */
  private refreshDashboardData(): void {
    // In real implementation, this would call SAP services
    console.log('Refreshing dashboard data from SAP...');
    
    // Simulate random updates
    this.pendingTasks = Math.floor(Math.random() * 10) + 1;
    
    // Add new activity occasionally
    if (Math.random() > 0.7) {
      this.recentActivity.unshift({
        type: 'system',
        message: 'Data synchronized with SAP ERP system',
        timestamp: new Date()
      });
      
      // Keep only recent 10 activities
      this.recentActivity = this.recentActivity.slice(0, 10);
    }
  }

  /**
   * Get profile image URL
   */
  getProfileImage(): string {
    // In real implementation, this would come from SAP or uploaded image
    return `https://ui-avatars.com/api/?name=${this.employee?.name}&background=14b8a6&color=fff&size=40`;
  }

  /**
   * Get manager profile image URL
   */
  getManagerImage(): string {
    return `https://ui-avatars.com/api/?name=${this.managerName}&background=3b82f6&color=fff&size=40`;
  }

  /**
   * Get team member profile image URL
   */
  getTeamMemberImage(memberName: string): string {
    return `https://ui-avatars.com/api/?name=${memberName}&background=8b5cf6&color=fff&size=40`;
  }

  /**
   * Get greeting based on current time
   */
  getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }

  /**
   * Calculate leave usage percentage
   */
  getLeaveUsagePercentage(type: 'annual' | 'sick'): number {
    if (type === 'annual') {
      return (this.annualLeaveUsed / this.annualLeaveTotal) * 100;
    } else {
      return (this.sickLeaveUsed / this.sickLeaveTotal) * 100;
    }
  }

  /**
   * Get activity icon based on type
   */
  getActivityIcon(type: string): string {
    const icons = {
      'leave': '🏖️',
      'payslip': '💰',
      'project': '📁',
      'attendance': '⏰',
      'system': '🔄'
    };
    return icons[type as keyof typeof icons] || '📝';
  }

  /**
   * Get relative time for activity
   */
  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  /**
   * Handle logout
   */
  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  // Navigation Methods
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToPayslip(): void {
    this.router.navigate(['/payslip']);
  }

  navigateToLeaveRequest(): void {
    this.router.navigate(['/leave-request']);
  }

  // Action Methods
  viewOrgChart(): void {
    console.log('Opening organization chart...');
    // Implement org chart modal or navigation
  }

  downloadPayslip(): void {
    console.log('Downloading latest payslip...');
    // Implement payslip download from SAP
  }

  viewSalaryHistory(): void {
    console.log('Opening salary history...');
    // Implement salary history view
  }

  viewAllProjects(): void {
    console.log('Opening projects view...');
    // Implement projects management
  }

  markAttendance(): void {
    console.log('Marking attendance...');
    // Implement attendance marking
  }

  submitTimesheet(): void {
    console.log('Opening timesheet...');
    // Implement timesheet submission
  }

  navigateToLeaveManagement(): void {
    if (this.employee?.employeeId) {
      this.router.navigate(['/leave-management', this.employee.employeeId]);
    } else {
      this.router.navigate(['/leave-management']);
    }
  }

  navigateToPaySlip(): void {
    if (this.employee?.employeeId) {
      this.router.navigate(['/payslip', this.employee.employeeId]);
    } else {
      this.router.navigate(['/payslip']);
    }
  }

  bookMeetingRoom(): void {
    console.log('Opening room booking...');
    // Implement meeting room booking
  }

  viewDirectory(): void {
    console.log('Opening employee directory...');
    // Implement employee directory
  }

  accessTraining(): void {
    console.log('Opening training portal...');
    // Implement training access
  }

  viewPolicies(): void {
    console.log('Opening HR policies...');
    // Implement HR policies view
  }

  viewAllActivity(): void {
    console.log('Opening activity history...');
    // Implement full activity history
  }

  // Header Navigation Methods

  /**
   * Toggle user dropdown menu
   */
  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  /**
   * Perform global search
   */
  performSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // TODO: Implement global search functionality
      // this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  /**
   * Close user menu when clicking outside
   */
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-section')) {
      this.showUserMenu = false;
    }
  }

  /**
   * Navigate to notifications
   */
  openNotifications(): void {
    console.log('Opening notifications...');
    // TODO: Implement notifications panel
  }

  /**
   * Navigate to messages
   */
  openMessages(): void {
    console.log('Opening messages...');
    // TODO: Implement messaging system
  }

  /**
   * Navigate to settings
   */
  openSettings(): void {
    console.log('Opening settings...');
    this.router.navigate(['/settings']);
  }

  /**
   * Navigate to help
   */
  openHelp(): void {
    console.log('Opening help...');
    // TODO: Implement help system
  }
}
