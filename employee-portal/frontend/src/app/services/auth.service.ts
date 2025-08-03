import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  employeeId: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    employee: Employee;
  };
}

export interface Employee {
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  role: string;
  joiningDate?: string; // Optional property for joining date
  manager?: string;     // Optional property for manager
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api`;
  private readonly TOKEN_KEY = 'employee_token';
  private readonly EMPLOYEE_KEY = 'employee_data';
  
  private currentEmployeeSubject = new BehaviorSubject<Employee | null>(null);
  public currentEmployee$ = this.currentEmployeeSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check if user is already logged in on service initialization
    this.checkAuthStatus();
  }

  /**
   * Employee login with frontend-only authentication (no backend required)
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    console.log('🔐 Frontend-only authentication for:', credentials.employeeId);
    
    // Frontend-only credential validation
    const isValid = this.validateCredentialsFrontend(credentials.employeeId, credentials.password);
    
    // Simulate API delay
    return new Observable<LoginResponse>(observer => {
      setTimeout(() => {
        if (isValid) {
          // Create mock employee data
          const mockEmployee = this.getMockEmployeeData(credentials.employeeId);
          const mockToken = this.generateMockToken(credentials.employeeId);
          
          // Store authentication data
          this.setAuthData(mockToken, mockEmployee);
          
          // Return success response
          observer.next({
            success: true,
            message: 'Login successful',
            data: {
              token: mockToken,
              employee: mockEmployee
            }
          });
        } else {
          // Return error response
          observer.next({
            success: false,
            message: 'Invalid Employee ID or password',
            data: undefined
          });
        }
        observer.complete();
      }, 1000); // 1 second delay to simulate real authentication
    });
  }

  /**
   * Frontend-only credential validation
   */
  private validateCredentialsFrontend(employeeId: string, password: string): boolean {
    // Demo credentials - same as backend
    const validCredentials: { [key: string]: string } = {
      'EMP001': 'password123',
      'EMP002': 'password123',
      'EMP003': 'password123',
      'EMP004': 'password123',
      'ADMIN': 'password123',
      'TEST001': 'password123',
      'USER001': 'password123',
      'DEMO': 'password123'
    };

    // Email-based credentials
    const emailCredentials: { [key: string]: string } = {
      'demo@company.com': 'password123',
      'john.doe@company.com': 'password123',
      'admin@company.com': 'password123'
    };

    // Check email format
    if (employeeId.includes('@')) {
      return emailCredentials[employeeId] === password;
    }

    // Check employee ID format
    return validCredentials[employeeId] === password;
  }

  /**
   * Generate mock JWT token
   */
  private generateMockToken(employeeId: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      employeeId: employeeId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    }));
    const signature = btoa('mock-signature-' + employeeId);
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Get mock employee data
   */
  private getMockEmployeeData(employeeId: string): Employee {
    const employeeData: { [key: string]: Employee } = {
      'EMP001': {
        employeeId: 'EMP001',
        name: 'John Doe',
        email: 'john.doe@company.com',
        department: 'Information Technology',
        designation: 'Software Engineer',
        role: 'Employee',
        joiningDate: '2023-01-15',
        manager: 'Jane Smith'
      },
      'EMP002': {
        employeeId: 'EMP002',
        name: 'Alice Johnson',
        email: 'alice.johnson@company.com',
        department: 'Human Resources',
        designation: 'HR Manager',
        role: 'Manager',
        joiningDate: '2022-03-10',
        manager: 'Robert Brown'
      },
      'EMP003': {
        employeeId: 'EMP003',
        name: 'Bob Wilson',
        email: 'bob.wilson@company.com',
        department: 'Finance',
        designation: 'Financial Analyst',
        role: 'Employee',
        joiningDate: '2023-06-01',
        manager: 'Carol Davis'
      },
      'EMP004': {
        employeeId: 'EMP004',
        name: 'Sarah Miller',
        email: 'sarah.miller@company.com',
        department: 'Marketing',
        designation: 'Marketing Specialist',
        role: 'Employee',
        joiningDate: '2023-04-12',
        manager: 'David Lee'
      },
      'ADMIN': {
        employeeId: 'ADMIN',
        name: 'System Administrator',
        email: 'admin@company.com',
        department: 'IT Administration',
        designation: 'System Admin',
        role: 'Admin',
        joiningDate: '2020-01-01',
        manager: 'CTO'
      }
    };

    // Handle email-based login
    if (employeeId.includes('@')) {
      const emailMapping: { [key: string]: string } = {
        'demo@company.com': 'EMP001',
        'john.doe@company.com': 'EMP001',
        'admin@company.com': 'ADMIN'
      };
      const mappedId = emailMapping[employeeId];
      if (mappedId && employeeData[mappedId]) {
        return employeeData[mappedId];
      }
    }

    return employeeData[employeeId] || {
      employeeId: employeeId,
      name: 'Demo Employee',
      email: `${employeeId.toLowerCase()}@company.com`,
      department: 'General',
      designation: 'Employee',
      role: 'Employee',
      joiningDate: '2023-01-01',
      manager: 'Manager'
    };
  }

  /**
   * Employee logout (frontend-only, no backend required)
   */
  logout(): Observable<any> {
    // Frontend-only logout - just clear local data
    console.log('🚪 Frontend-only logout');
    this.clearAuthData();
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Logged out successfully' });
        observer.complete();
      }, 500);
    });
  }

  /**
   * Verify token validity (frontend-only)
   */
  verifyToken(): Observable<any> {
    const token = this.getToken();
    
    return new Observable(observer => {
      if (token && this.isTokenValid(token)) {
        observer.next({ success: true, valid: true });
      } else {
        this.clearAuthData();
        observer.next({ success: false, valid: false });
      }
      observer.complete();
    });
  }

  /**
   * Check if mock token is valid (basic check)
   */
  private isTokenValid(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Get current employee data
   */
  getCurrentEmployee(): Employee | null {
    return this.currentEmployeeSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Set authentication data
   */
  private setAuthData(token: string, employee: Employee): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.EMPLOYEE_KEY, JSON.stringify(employee));
    }
    
    this.currentEmployeeSubject.next(employee);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.EMPLOYEE_KEY);
    }
    
    this.currentEmployeeSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check authentication status from stored data
   */
  private checkAuthStatus(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const employeeData = localStorage.getItem(this.EMPLOYEE_KEY);
      
      if (token && employeeData) {
        try {
          const employee = JSON.parse(employeeData);
          this.currentEmployeeSubject.next(employee);
          this.isAuthenticatedSubject.next(true);
          
          // Verify token validity
          this.verifyToken().subscribe({
            next: () => {
              console.log('Token verified successfully');
            },
            error: () => {
              console.log('Token verification failed, clearing auth data');
              this.clearAuthData();
            }
          });
        } catch (error) {
          console.error('Error parsing stored employee data:', error);
          this.clearAuthData();
        }
      }
    }
  }

  /**
   * Get authentication headers
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}
