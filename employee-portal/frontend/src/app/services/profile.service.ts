import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface EmployeeProfile {
  // Basic Information
  employeeId: string;
  name: string;
  email: string;
  phoneNumber: string;
  alternatePhone?: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  
  // Professional Information
  department: string;
  designation: string;
  jobTitle: string;
  employeeType: string; // Full-time, Part-time, Contract
  employmentStatus: string; // Active, Inactive, On Leave
  joiningDate: string;
  confirmationDate?: string;
  reportingManager: string;
  workLocation: string;
  costCenter: string;
  
  // Personal Details
  fatherName: string;
  motherName: string;
  spouseName?: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Address Information
  currentAddress: AddressInfo;
  permanentAddress: AddressInfo;
  
  // Salary Information
  basicSalary: number;
  grossSalary: number;
  ctc: number;
  payGrade: string;
  salaryAccount: BankInfo;
  
  // Educational Background
  education: EducationInfo[];
  
  // Experience
  previousExperience: ExperienceInfo[];
  
  // Skills and Certifications
  skills: string[];
  certifications: CertificationInfo[];
  
  // Additional Information
  photoUrl?: string;
  panNumber: string;
  aadharNumber: string;
  passportNumber?: string;
  drivingLicenseNumber?: string;
  
  // SAP Specific Fields
  sapPersonnelNumber: string;
  sapOrgUnit: string;
  sapPosition: string;
  lastSapSync: string;
}

export interface AddressInfo {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
}

export interface EducationInfo {
  degree: string;
  institution: string;
  yearOfPassing: number;
  percentage: number;
  specialization?: string;
}

export interface ExperienceInfo {
  company: string;
  designation: string;
  duration: string;
  responsibilities: string;
}

export interface CertificationInfo {
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly API_URL = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  /**
   * Get complete employee profile from SAP ERP via SAP PO
   */
  getEmployeeProfile(employeeId: string): Observable<EmployeeProfile> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<any>(`${this.API_URL}/profile/${employeeId}`, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch employee profile');
          }
        }),
        catchError(error => {
          console.error('ProfileService Error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Update employee profile in SAP ERP
   */
  updateEmployeeProfile(employeeId: string, profileData: Partial<EmployeeProfile>): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.put<any>(`${this.API_URL}/profile/${employeeId}`, profileData, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response;
          } else {
            throw new Error(response.message || 'Failed to update employee profile');
          }
        }),
        catchError(error => {
          console.error('ProfileService Update Error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Upload employee photo
   */
  uploadEmployeePhoto(employeeId: string, photoFile: File): Observable<any> {
    const headers = this.getAuthHeaders();
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    return this.http.post<any>(`${this.API_URL}/profile/${employeeId}/photo`, formData, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response;
          } else {
            throw new Error(response.message || 'Failed to upload photo');
          }
        }),
        catchError(error => {
          console.error('Photo Upload Error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get employee organizational chart
   */
  getOrganizationalChart(employeeId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    
    return this.http.get<any>(`${this.API_URL}/profile/${employeeId}/org-chart`, { headers })
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          } else {
            throw new Error(response.message || 'Failed to fetch organizational chart');
          }
        }),
        catchError(error => {
          console.error('Org Chart Error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get auth headers with JWT token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('employee_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
