const axios = require('axios');
const bcrypt = require('bcryptjs');

class SAPService {
  constructor() {
    this.baseURL = process.env.SAP_PO_BASE_URL;
    this.username = process.env.SAP_PO_USERNAME;
    this.password = process.env.SAP_PO_PASSWORD;
    this.client = process.env.SAP_PO_CLIENT;
    this.language = process.env.SAP_PO_LANGUAGE || 'EN';
  }

  /**
   * Create axios instance with SAP PO configuration
   */
  createSAPClient() {
    return axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      auth: {
        username: this.username,
        password: this.password
      }
    });
  }

  /**
   * Check if employee exists in SAP standard table (PA0001)
   * @param {string} employeeId - Employee ID
   * @returns {Object} - Result object with success status
   */
  async checkEmployeeExists(employeeId) {
    try {
      console.log(`Checking employee existence in SAP for ID: ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      // Call SAP PO interface to check employee in standard table
      const response = await sapClient.post('/employee/check-existence', {
        employeeId: employeeId,
        client: this.client,
        language: this.language
      });

      if (response.data && response.data.exists) {
        console.log(`Employee ${employeeId} found in SAP standard table`);
        return {
          success: true,
          exists: true,
          data: response.data
        };
      } else {
        console.log(`Employee ${employeeId} not found in SAP standard table`);
        return {
          success: false,
          exists: false,
          message: 'Employee not found in standard table'
        };
      }
    } catch (error) {
      console.error('Error checking employee existence:', error.message);
      
      // For development/testing purposes, simulate positive response
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating employee exists check');
        return {
          success: true,
          exists: true,
          simulated: true
        };
      }
      
      return {
        success: false,
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * Authenticate employee credentials via SAP PO interface
   * @param {string} employeeId - Employee ID
   * @param {string} password - Employee password
   * @returns {Object} - Authentication result
   */
  async authenticateEmployee(employeeId, password) {
    try {
      console.log(`Authenticating employee ${employeeId} via SAP PO interface`);
      
      const sapClient = this.createSAPClient();
      
      // Call SAP PO interface to authenticate against custom Z-table
      const response = await sapClient.post('/employee/authenticate', {
        employeeId: employeeId,
        password: password, // In real implementation, this should be hashed
        client: this.client,
        language: this.language
      });

      if (response.data && response.data.authenticated) {
        console.log(`Authentication successful for employee ${employeeId}`);
        return {
          success: true,
          authenticated: true,
          data: response.data
        };
      } else {
        console.log(`Authentication failed for employee ${employeeId}`);
        return {
          success: false,
          authenticated: false,
          message: 'Invalid credentials'
        };
      }
    } catch (error) {
      console.error('Error authenticating employee:', error.message);
      
      // For development/testing purposes, simulate authentication
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Simulating authentication');
        // Simple validation for demo (in real app, this would be from SAP)
        const isValid = this.validateDemoCredentials(employeeId, password);
        return {
          success: isValid,
          authenticated: isValid,
          simulated: true
        };
      }
      
      return {
        success: false,
        authenticated: false,
        error: error.message
      };
    }
  }

  /**
   * Demo credential validation for development
   */
  validateDemoCredentials(employeeId, password) {
    console.log(`🔍 Validating demo credentials for: ${employeeId}`);
    
    // Demo credentials for testing
    const demoCredentials = {
      'EMP001': 'password123',
      'EMP002': 'password123', // Updated to match EMP001 for consistency
      'EMP003': 'password123', // Updated to match EMP001 for consistency  
      'EMP004': 'password123', // Updated to match EMP001 for consistency
      'ADMIN': 'password123',
      'TEST001': 'password123', // Updated to match EMP001 for consistency
      'USER001': 'password123',
      'DEMO': 'password123' // Updated to match EMP001 for consistency
    };
    
    // Also support email-based login for demo
    const emailCredentials = {
      'demo@company.com': 'password123', // Updated to match standard password
      'john.doe@company.com': 'password123',
      'admin@company.com': 'password123'
    };
    
    // Check if it's an email format
    if (employeeId.includes('@')) {
      const isValid = emailCredentials[employeeId] === password;
      console.log(`📧 Email validation result for ${employeeId}: ${isValid}`);
      return isValid;
    }
    
    // Check employee ID format
    const isValid = demoCredentials[employeeId] === password;
    console.log(`🆔 Employee ID validation result for ${employeeId}: ${isValid}`);
    return isValid;
  }

  /**
   * Get employee details from SAP HR module
   * @param {string} employeeId - Employee ID
   * @returns {Object} - Employee details
   */
  async getEmployeeDetails(employeeId) {
    try {
      console.log(`Fetching employee details for ${employeeId} from SAP HR`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.get(`/employee/details/${employeeId}`, {
        params: {
          client: this.client,
          language: this.language
        }
      });

      if (response.data) {
        return {
          employeeId: response.data.employeeId,
          name: response.data.name,
          email: response.data.email,
          department: response.data.department,
          designation: response.data.designation,
          role: response.data.role,
          joiningDate: response.data.joiningDate,
          manager: response.data.manager
        };
      }
    } catch (error) {
      console.error('Error fetching employee details:', error.message);
      
      // Demo data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getDemoEmployeeDetails(employeeId);
      }
      
      throw new Error('Failed to fetch employee details from SAP');
    }
  }

  /**
   * Demo employee details for development
   */
  getDemoEmployeeDetails(employeeId) {
    const demoEmployees = {
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
      },
      'TEST001': {
        employeeId: 'TEST001',
        name: 'Test User',
        email: 'test.user@company.com',
        department: 'Quality Assurance',
        designation: 'QA Tester',
        role: 'Employee',
        joiningDate: '2023-08-01',
        manager: 'QA Lead'
      },
      'USER001': {
        employeeId: 'USER001',
        name: 'Demo User',
        email: 'demo.user@company.com',
        department: 'Sales',
        designation: 'Sales Representative',
        role: 'Employee',
        joiningDate: '2023-07-15',
        manager: 'Sales Manager'
      },
      'DEMO': {
        employeeId: 'DEMO',
        name: 'Demo Employee',
        email: 'demo@company.com',
        department: 'Technology',
        designation: 'Senior Developer',
        role: 'Employee',
        joiningDate: '2023-01-01',
        manager: 'Tech Lead'
      }
    };
    
    // Handle email-based login
    if (employeeId.includes('@')) {
      const emailMapping = {
        'demo@company.com': 'DEMO'
      };
      const mappedId = emailMapping[employeeId];
      if (mappedId && demoEmployees[mappedId]) {
        return demoEmployees[mappedId];
      }
    }
    
    return demoEmployees[employeeId] || {
      employeeId: employeeId,
      name: 'Unknown Employee',
      email: `${employeeId.toLowerCase()}@company.com`,
      department: 'General',
      designation: 'Employee',
      role: 'Employee',
      joiningDate: '2023-01-01',
      manager: 'TBD'
    };
  }

  /**
   * Get employee payslip from SAP FI module
   * @param {string} employeeId - Employee ID
   * @param {string} month - Month (01-12)
   * @param {string} year - Year (YYYY)
   * @returns {Object} - Payslip data
   */
  async getPayslip(employeeId, month, year) {
    try {
      console.log(`Fetching payslip for ${employeeId} - ${month}/${year}`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.get(`/payroll/payslip/${employeeId}`, {
        params: {
          month: month,
          year: year,
          client: this.client,
          language: this.language
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching payslip:', error.message);
      
      // Demo payslip data for development
      if (process.env.NODE_ENV === 'development') {
        return this.getDemoPayslip(employeeId, month, year);
      }
      
      throw new Error('Failed to fetch payslip from SAP');
    }
  }

  /**
   * Demo payslip data for development
   */
  getDemoPayslip(employeeId, month, year) {
    return {
      employeeId: employeeId,
      month: month,
      year: year,
      basicSalary: 50000,
      allowances: {
        hra: 15000,
        transport: 3000,
        medical: 2000
      },
      deductions: {
        pf: 6000,
        tax: 8000,
        insurance: 1000
      },
      grossSalary: 70000,
      netSalary: 55000,
      payPeriod: `${month}/${year}`,
      payDate: `${year}-${month}-28`
    };
  }

  /**
   * Get employee leave balance from SAP HR module
   * @param {string} employeeId - Employee ID
   * @returns {Object} - Leave balance data
   */
  async getLeaveBalance(employeeId) {
    try {
      console.log(`Fetching leave balance for ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.get(`/leave/balance/${employeeId}`, {
        params: {
          client: this.client,
          language: this.language
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching leave balance:', error.message);
      
      // Demo leave balance for development
      if (process.env.NODE_ENV === 'development') {
        return this.getDemoLeaveBalance(employeeId);
      }
      
      throw new Error('Failed to fetch leave balance from SAP');
    }
  }

  /**
   * Demo leave balance for development
   */
  getDemoLeaveBalance(employeeId) {
    return {
      employeeId: employeeId,
      annualLeave: {
        total: 25,
        used: 8,
        remaining: 17
      },
      sickLeave: {
        total: 10,
        used: 2,
        remaining: 8
      },
      casualLeave: {
        total: 12,
        used: 5,
        remaining: 7
      },
      year: new Date().getFullYear()
    };
  }

  /**
   * Submit leave request to SAP HR module
   * @param {string} employeeId - Employee ID
   * @param {Object} leaveRequest - Leave request details
   * @returns {Object} - Submission result
   */
  async submitLeaveRequest(employeeId, leaveRequest) {
    try {
      console.log(`Submitting leave request for ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.post('/leave/request', {
        employeeId: employeeId,
        ...leaveRequest,
        client: this.client,
        language: this.language
      });

      return response.data;
    } catch (error) {
      console.error('Error submitting leave request:', error.message);
      
      // Demo submission for development
      if (process.env.NODE_ENV === 'development') {
        return {
          requestId: `REQ${Date.now()}`,
          status: 'submitted',
          message: 'Leave request submitted successfully',
          approvalRequired: true
        };
      }
      
      throw new Error('Failed to submit leave request to SAP');
    }
  }

  /**
   * Get comprehensive employee profile data from SAP ERP
   * @param {string} employeeId - Employee ID
   * @returns {Object} - Complete employee profile data
   */
  async getEmployeeProfileData(employeeId) {
    try {
      console.log(`Fetching comprehensive profile data for employee: ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      // Call SAP PO interface for comprehensive employee data
      const response = await sapClient.post('/employee/profile/comprehensive', {
        employeeId: employeeId,
        client: this.client,
        language: this.language,
        includeAll: true
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive employee profile:', error.message);
      
      // Demo data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          // Personal Information
          employeeId: employeeId,
          personnelNumber: `P${employeeId}`,
          firstName: 'John',
          lastName: 'Doe',
          middleName: 'Michael',
          fullName: 'John Michael Doe',
          gender: 'Male',
          dateOfBirth: '1990-05-15',
          nationality: 'Indian',
          maritalStatus: 'Married',
          religion: 'Hindu',
          bloodGroup: 'O+',
          photoUrl: '/assets/images/default-avatar.png',

          // Contact Information
          personalEmail: 'john.doe@personal.com',
          workEmail: 'john.doe@company.com',
          personalMobile: '+91 9876543210',
          workMobile: '+91 9876543211',
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+91 9876543212'
          },

          // Professional Information
          designation: 'Senior Software Developer',
          department: 'Information Technology',
          division: 'Digital Solutions',
          location: 'Bangalore',
          reportingManager: {
            employeeId: 'EMP002',
            name: 'Alice Johnson',
            designation: 'Technical Lead'
          },
          joiningDate: '2020-01-15',
          confirmationDate: '2020-07-15',
          employmentType: 'Permanent',
          status: 'Active',
          costCenter: 'IT001',
          grade: 'L3',
          level: 'Senior',

          // Salary Information
          salary: {
            basic: 50000,
            hra: 20000,
            conveyance: 5000,
            medical: 3000,
            special: 12000,
            gross: 90000,
            pf: 6000,
            esi: 750,
            tax: 8000,
            net: 75250,
            currency: 'INR',
            effectiveDate: '2024-01-01'
          },

          // Bank Details
          bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC Bank',
            branchName: 'Bangalore Main Branch',
            accountType: 'Savings'
          },

          // Address Information
          addresses: {
            permanent: {
              type: 'Permanent',
              street: '123 Main Street',
              area: 'Koramangala',
              city: 'Bangalore',
              state: 'Karnataka',
              country: 'India',
              pincode: '560034'
            },
            current: {
              type: 'Current',
              street: '456 Tech Park',
              area: 'Electronic City',
              city: 'Bangalore',
              state: 'Karnataka',
              country: 'India',
              pincode: '560100'
            }
          },

          // Education Details
          education: [
            {
              degree: 'Bachelor of Technology',
              major: 'Computer Science and Engineering',
              institution: 'ABC University',
              university: 'ABC University',
              year: 2018,
              percentage: 85.5,
              location: 'Bangalore'
            },
            {
              degree: 'Higher Secondary',
              major: 'Science',
              institution: 'XYZ School',
              university: 'State Board',
              year: 2014,
              percentage: 92.0,
              location: 'Chennai'
            }
          ],

          // Skills and Certifications
          skills: [
            'JavaScript', 'TypeScript', 'Angular', 'Node.js', 'React',
            'Python', 'Java', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git'
          ],

          certifications: [
            {
              name: 'AWS Certified Solutions Architect',
              organization: 'Amazon Web Services',
              issueDate: '2023-06-15',
              expiryDate: '2026-06-15',
              certificateId: 'AWS-SA-2023-001'
            },
            {
              name: 'Certified Angular Developer',
              organization: 'Google',
              issueDate: '2022-12-10',
              expiryDate: '2025-12-10',
              certificateId: 'GOOGLE-ANG-2022-456'
            }
          ],

          // Government IDs
          governmentIds: {
            pan: 'ABCDE1234F',
            aadhar: '1234-5678-9012',
            passport: 'A12345678',
            drivingLicense: 'KA01-2023-1234567',
            voterID: 'ABC1234567'
          },

          // Work Schedule
          workSchedule: {
            workingHours: '9:00 AM - 6:00 PM',
            workingDays: 'Monday to Friday',
            shiftType: 'Regular',
            timeZone: 'Asia/Kolkata'
          },

          // Attendance Summary (Current Month)
          attendanceSummary: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            workingDays: 22,
            presentDays: 20,
            absentDays: 2,
            leaveDays: 0,
            attendancePercentage: 90.9
          },

          // Leave Balance
          leaveBalance: {
            annual: { total: 21, used: 5, remaining: 16 },
            sick: { total: 10, used: 2, remaining: 8 },
            casual: { total: 12, used: 3, remaining: 9 },
            maternity: { total: 180, used: 0, remaining: 180 },
            paternity: { total: 15, used: 0, remaining: 15 }
          },

          // System Information
          systemInfo: {
            createdDate: '2020-01-15',
            lastModified: new Date().toISOString(),
            syncedDate: new Date().toISOString(),
            version: '1.0'
          }
        };
      }
      
      throw new Error('Failed to fetch employee profile from SAP');
    }
  }

  /**
   * Update employee profile data in SAP
   * @param {string} employeeId - Employee ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Updated profile data
   */
  async updateEmployeeProfile(employeeId, updateData) {
    try {
      console.log(`Updating profile data for employee: ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.put('/employee/profile/update', {
        employeeId: employeeId,
        updateData: updateData,
        client: this.client,
        language: this.language
      });

      return response.data;
    } catch (error) {
      console.error('Error updating employee profile:', error.message);
      
      // Demo update for development
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: 'Profile updated successfully',
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        };
      }
      
      throw new Error('Failed to update employee profile in SAP');
    }
  }

  /**
   * Update employee photo in SAP
   * @param {string} employeeId - Employee ID
   * @param {string} photoUrl - Photo URL
   * @returns {Object} - Update result
   */
  async updateEmployeePhoto(employeeId, photoUrl) {
    try {
      console.log(`Updating photo for employee: ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.put('/employee/photo/update', {
        employeeId: employeeId,
        photoUrl: photoUrl,
        client: this.client,
        language: this.language
      });

      return response.data;
    } catch (error) {
      console.error('Error updating employee photo:', error.message);
      
      // Demo update for development
      if (process.env.NODE_ENV === 'development') {
        return {
          success: true,
          message: 'Photo updated successfully',
          photoUrl: photoUrl,
          timestamp: new Date().toISOString()
        };
      }
      
      throw new Error('Failed to update employee photo in SAP');
    }
  }

  /**
   * Get employee attendance data
   * @param {string} employeeId - Employee ID
   * @param {string} year - Year
   * @param {string} month - Month
   * @returns {Object} - Attendance data
   */
  async getEmployeeAttendance(employeeId, year, month) {
    try {
      console.log(`Fetching attendance data for employee: ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.post('/employee/attendance', {
        employeeId: employeeId,
        year: year || new Date().getFullYear(),
        month: month || new Date().getMonth() + 1,
        client: this.client,
        language: this.language
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching attendance data:', error.message);
      
      // Demo data for development
      if (process.env.NODE_ENV === 'development') {
        return {
          month: month || new Date().getMonth() + 1,
          year: year || new Date().getFullYear(),
          workingDays: 22,
          presentDays: 20,
          absentDays: 2,
          leaveDays: 0,
          overtimeHours: 8,
          attendancePercentage: 90.9,
          dailyAttendance: Array.from({ length: 30 }, (_, i) => ({
            date: `2024-${(month || new Date().getMonth() + 1).toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`,
            status: Math.random() > 0.1 ? 'Present' : 'Absent',
            inTime: '09:15',
            outTime: '18:30',
            workingHours: 8.25
          }))
        };
      }
      
      throw new Error('Failed to fetch attendance data from SAP');
    }
  }

  /**
   * Get employee payslips
   * @param {string} employeeId - Employee ID
   * @param {string} year - Year
   * @param {number} limit - Number of payslips to fetch
   * @returns {Array} - Payslips data
   */
  async getEmployeePayslips(employeeId, year, limit = 12) {
    try {
      console.log(`Fetching payslips for employee: ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.post('/employee/payslips', {
        employeeId: employeeId,
        year: year || new Date().getFullYear(),
        limit: limit,
        client: this.client,
        language: this.language
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching payslips:', error.message);
      
      // Demo data for development
      if (process.env.NODE_ENV === 'development') {
        return Array.from({ length: Math.min(limit, 12) }, (_, i) => ({
          payPeriod: `${year || new Date().getFullYear()}-${(12 - i).toString().padStart(2, '0')}`,
          basic: 50000,
          hra: 20000,
          conveyance: 5000,
          medical: 3000,
          special: 12000,
          gross: 90000,
          pf: 6000,
          esi: 750,
          tax: 8000,
          net: 75250,
          payDate: `${year || new Date().getFullYear()}-${(12 - i).toString().padStart(2, '0')}-01`
        }));
      }
      
      throw new Error('Failed to fetch payslips from SAP');
    }
  }

  /**
   * Refresh employee data from SAP (force sync)
   * @param {string} employeeId - Employee ID
   * @returns {Object} - Refreshed data
   */
  async refreshEmployeeData(employeeId) {
    try {
      console.log(`Refreshing data for employee: ${employeeId}`);
      
      const sapClient = this.createSAPClient();
      
      const response = await sapClient.post('/employee/refresh', {
        employeeId: employeeId,
        client: this.client,
        language: this.language,
        forceSync: true
      });

      return response.data;
    } catch (error) {
      console.error('Error refreshing employee data:', error.message);
      
      // Demo refresh for development
      if (process.env.NODE_ENV === 'development') {
        return await this.getEmployeeProfileData(employeeId);
      }
      
      throw new Error('Failed to refresh employee data from SAP');
    }
  }
}

module.exports = new SAPService();
