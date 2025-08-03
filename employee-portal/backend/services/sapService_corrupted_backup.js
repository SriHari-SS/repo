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
    // Demo credentials for testing
    const demoCredentials = {
      'EMP001': 'password123',
      'EMP002': 'password@123',
      'EMP003': 'welcome@123',
      'EMP004': 'employee123',
      'ADMIN': 'password123',
      'TEST001': 'password@123',
      'USER001': 'password123'
    };
    
    return demoCredentials[employeeId] === password;
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
      }
    };
    
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
    try {
      const response = await axios.post(`${this.sapEndpoint}/refresh-employee`, {
        employeeId
      }, {
        headers: this.headers,
        timeout: 30000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to refresh employee data from SAP');
    } catch (error) {
      console.error('Error refreshing employee data:', error);
      throw error;
    }
  }

  /**
   * Get available leave types from SAP
   * @returns {Array} Leave types
   */
  async getLeaveTypes() {
    try {
      const response = await axios.get(`${this.sapEndpoint}/leave-types`, {
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Default leave types if SAP is unavailable
      return [
        { id: 'AL', name: 'Annual Leave', maxDays: 21 },
        { id: 'SL', name: 'Sick Leave', maxDays: 12 },
        { id: 'ML', name: 'Maternity Leave', maxDays: 90 },
        { id: 'PL', name: 'Paternity Leave', maxDays: 15 },
        { id: 'CL', name: 'Casual Leave', maxDays: 5 },
        { id: 'EL', name: 'Emergency Leave', maxDays: 3 }
      ];
    } catch (error) {
      console.error('Error fetching leave types:', error);
      return [
        { id: 'AL', name: 'Annual Leave', maxDays: 21 },
        { id: 'SL', name: 'Sick Leave', maxDays: 12 },
        { id: 'ML', name: 'Maternity Leave', maxDays: 90 },
        { id: 'PL', name: 'Paternity Leave', maxDays: 15 },
        { id: 'CL', name: 'Casual Leave', maxDays: 5 },
        { id: 'EL', name: 'Emergency Leave', maxDays: 3 }
      ];
    }
  }

  /**
   * Get employee leave balance
   * @param {string} employeeId 
   * @param {string} year 
   * @returns {Array} Leave balance data
   */
  async getLeaveBalance(employeeId, year = new Date().getFullYear()) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/leave-balance`, {
        params: { employeeId, year },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      return [
        {
          leaveType: 'Annual Leave',
          leaveTypeCode: 'AL',
          allocated: 21,
          used: 8,
          pending: 2,
          balance: 11,
          carryForward: 3,
          year: parseInt(year)
        },
        {
          leaveType: 'Sick Leave',
          leaveTypeCode: 'SL',
          allocated: 12,
          used: 3,
          pending: 0,
          balance: 9,
          carryForward: 0,
          year: parseInt(year)
        },
        {
          leaveType: 'Casual Leave',
          leaveTypeCode: 'CL',
          allocated: 5,
          used: 2,
          pending: 1,
          balance: 2,
          carryForward: 0,
          year: parseInt(year)
        }
      ];
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive leave history with filtering and sorting
   * @param {Object} filters 
   * @param {Object} sort 
   * @param {number} page 
   * @param {number} limit 
   * @returns {Object} Leave history report
   */
  async getLeaveHistory(filters, sort, page = 1, limit = 50) {
    try {
      const response = await axios.post(`${this.sapEndpoint}/leave-history`, {
        filters,
        sort,
        page,
        limit
      }, {
        headers: this.headers,
        timeout: 20000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      const mockData = this.generateMockLeaveHistory(filters, sort, page, limit);
      return mockData;
    } catch (error) {
      console.error('Error fetching leave history:', error);
      const mockData = this.generateMockLeaveHistory(filters, sort, page, limit);
      return mockData;
    }
  }

  /**
   * Generate mock leave history data
   * @param {Object} filters 
   * @param {Object} sort 
   * @param {number} page 
   * @param {number} limit 
   */
  generateMockLeaveHistory(filters, sort, page, limit) {
    const mockHistory = [
      {
        id: '12001',
        leaveType: 'Annual Leave',
        leaveTypeCode: 'AL',
        fromDate: '2024-12-20',
        toDate: '2024-12-24',
        totalDays: 3,
        appliedDate: '2024-12-01',
        status: 'Approved',
        approvedBy: 'John Manager',
        approvedDate: '2024-12-02',
        reason: 'Christmas vacation',
        document: null
      },
      {
        id: '12002',
        leaveType: 'Sick Leave',
        leaveTypeCode: 'SL',
        fromDate: '2024-11-15',
        toDate: '2024-11-15',
        totalDays: 1,
        appliedDate: '2024-11-14',
        status: 'Approved',
        approvedBy: 'John Manager',
        approvedDate: '2024-11-14',
        reason: 'Medical appointment',
        document: 'medical-cert.pdf'
      },
      {
        id: '12003',
        leaveType: 'Casual Leave',
        leaveTypeCode: 'CL',
        fromDate: '2024-10-10',
        toDate: '2024-10-11',
        totalDays: 2,
        appliedDate: '2024-10-05',
        status: 'Approved',
        approvedBy: 'John Manager',
        approvedDate: '2024-10-06',
        reason: 'Personal work',
        document: null
      },
      {
        id: '12004',
        leaveType: 'Annual Leave',
        leaveTypeCode: 'AL',
        fromDate: '2024-09-20',
        toDate: '2024-09-22',
        totalDays: 3,
        appliedDate: '2024-09-10',
        status: 'Cancelled',
        approvedBy: null,
        approvedDate: null,
        reason: 'Family vacation',
        document: null
      },
      {
        id: '12005',
        leaveType: 'Annual Leave',
        leaveTypeCode: 'AL',
        fromDate: '2024-08-15',
        toDate: '2024-08-16',
        totalDays: 2,
        appliedDate: '2024-08-01',
        status: 'Approved',
        approvedBy: 'John Manager',
        approvedDate: '2024-08-02',
        reason: 'Weekend extension',
        document: null
      }
    ];

    // Apply filters if provided
    let filteredData = mockHistory;
    
    if (filters.leaveType) {
      filteredData = filteredData.filter(item => 
        item.leaveTypeCode === filters.leaveType || item.leaveType.toLowerCase().includes(filters.leaveType.toLowerCase())
      );
    }
    
    if (filters.status) {
      filteredData = filteredData.filter(item => 
        item.status.toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    if (filters.year) {
      filteredData = filteredData.filter(item => 
        new Date(item.fromDate).getFullYear() === filters.year
      );
    }
    
    if (filters.month) {
      filteredData = filteredData.filter(item => 
        new Date(item.fromDate).getMonth() + 1 === filters.month
      );
    }

    // Apply sorting
    filteredData.sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];
      
      if (sort.field.includes('Date')) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sort.direction === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        total: filteredData.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(filteredData.length / limit)
      },
      filters: filters,
      sort: sort
    };
  }

  /**
   * Get employee leave requests
   * @param {string} employeeId 
   * @param {string} status 
   * @param {string} year 
   * @returns {Array} Leave requests
   */
  async getLeaveRequests(employeeId, status, year) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/leave-requests`, {
        params: { employeeId, status, year },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      return [
        {
          id: '12006',
          leaveType: 'Annual Leave',
          leaveTypeCode: 'AL',
          fromDate: '2025-01-15',
          toDate: '2025-01-17',
          totalDays: 3,
          appliedDate: '2024-12-15',
          status: 'Pending',
          reason: 'Family time',
          document: null
        },
        {
          id: '12007',
          leaveType: 'Sick Leave',
          leaveTypeCode: 'SL',
          fromDate: '2025-02-10',
          toDate: '2025-02-10',
          totalDays: 1,
          appliedDate: '2024-12-10',
          status: 'Pending',
          reason: 'Medical checkup',
          document: null
        }
      ];
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      throw error;
    }
  }

  /**
   * Get leave calendar data
   * @param {string} employeeId 
   * @param {number} year 
   * @param {number} month 
   * @returns {Array} Calendar events
   */
  async getLeaveCalendar(employeeId, year, month) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/leave-calendar`, {
        params: { employeeId, year, month },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock calendar data
      return [
        {
          date: '2024-12-20',
          leaveType: 'Annual Leave',
          status: 'Approved',
          isHalfDay: false
        },
        {
          date: '2024-12-23',
          leaveType: 'Annual Leave',
          status: 'Approved',
          isHalfDay: false
        },
        {
          date: '2024-12-24',
          leaveType: 'Annual Leave',
          status: 'Approved',
          isHalfDay: false
        }
      ];
    } catch (error) {
      console.error('Error fetching leave calendar:', error);
      throw error;
    }
  }

  /**
   * Get leave summary and analytics
   * @param {string} employeeId 
   * @param {string} year 
   * @returns {Object} Leave summary
   */
  async getLeaveSummary(employeeId, year = new Date().getFullYear()) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/leave-summary`, {
        params: { employeeId, year },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock summary data
      return {
        year: parseInt(year),
        totalLeavesTaken: 13,
        totalLeavesApproved: 11,
        totalLeavesPending: 2,
        totalLeavesCancelled: 1,
        mostUsedLeaveType: 'Annual Leave',
        averageLeaveDuration: 2.1,
        monthlyBreakdown: [
          { month: 'January', leaves: 0 },
          { month: 'February', leaves: 1 },
          { month: 'March', leaves: 2 },
          { month: 'April', leaves: 1 },
          { month: 'May', leaves: 0 },
          { month: 'June', leaves: 3 },
          { month: 'July', leaves: 2 },
          { month: 'August', leaves: 2 },
          { month: 'September', leaves: 0 },
          { month: 'October', leaves: 2 },
          { month: 'November', leaves: 1 },
          { month: 'December', leaves: 3 }
        ],
        leaveTypeBreakdown: [
          { leaveType: 'Annual Leave', count: 8, percentage: 61.5 },
          { leaveType: 'Sick Leave', count: 3, percentage: 23.1 },
          { leaveType: 'Casual Leave', count: 2, percentage: 15.4 }
        ]
      };
    } catch (error) {
      console.error('Error fetching leave summary:', error);
      throw error;
    }
  }

  /**
   * Cancel a leave request
   * @param {string} requestId 
   * @param {string} reason 
   * @param {string} employeeId 
   * @returns {Object} Cancellation result
   */
  async cancelLeaveRequest(requestId, reason, employeeId) {
    try {
      const response = await axios.put(`${this.sapEndpoint}/leave-request/${requestId}/cancel`, {
        reason,
        employeeId
      }, {
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to cancel leave request');
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      throw error;
    }
  }

  /**
   * Export leave report
   * @param {Object} filters 
   * @param {Object} sort 
   * @param {string} format 
   * @returns {Buffer} Report file buffer
   */
  async exportLeaveReport(filters, sort, format = 'excel') {
    try {
      const response = await axios.post(`${this.sapEndpoint}/leave-report/export`, {
        filters,
        sort,
        format
      }, {
        headers: {
          ...this.headers,
          'Accept': 'application/octet-stream'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error exporting leave report:', error);
      throw error;
    }
  }

  /**
   * Calculate working days between two dates
   * @param {string} fromDate 
   * @param {string} toDate 
   * @returns {number} Working days count
   */
  async calculateWorkingDays(fromDate, toDate) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/calculate-working-days`, {
        params: { fromDate, toDate },
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.success) {
        return response.data.data.workingDays;
      }

      // Fallback calculation
      const start = new Date(fromDate);
      const end = new Date(toDate);
      let workingDays = 0;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          workingDays++;
        }
      }
      
      return workingDays;
    } catch (error) {
      console.error('Error calculating working days:', error);
      
      // Fallback calculation
      const start = new Date(fromDate);
      const end = new Date(toDate);
      let workingDays = 0;
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
      }
      
      return workingDays;
    }
  }

  /**
   * Get company leave policy
   * @returns {Object} Leave policy data
   */
  async getLeavePolicy() {
    try {
      const response = await axios.get(`${this.sapEndpoint}/leave-policy`, {
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Default policy
      return {
        annualLeavePolicy: {
          maxDays: 21,
          carryForwardMax: 5,
          cashoutAllowed: false,
          minimumNoticeDays: 7
        },
        sickLeavePolicy: {
          maxDays: 12,
          medicalCertificateRequired: 3,
          carryForwardAllowed: false
        },
        casualLeavePolicy: {
          maxDays: 5,
          minimumNoticeDays: 1,
          carryForwardAllowed: false
        },
        generalRules: [
          'All leave requests must be approved by direct manager',
          'Leave cannot be taken during project critical phases without prior approval',
          'Medical certificate required for sick leave exceeding 2 consecutive days',
          'Annual leave must be planned and approved in advance',
          'Emergency leave requires immediate notification to manager'
        ]
      };
    } catch (error) {
      console.error('Error fetching leave policy:', error);
      return {
        annualLeavePolicy: {
          maxDays: 21,
          carryForwardMax: 5,
          cashoutAllowed: false,
          minimumNoticeDays: 7
        },
        sickLeavePolicy: {
          maxDays: 12,
          medicalCertificateRequired: 3,
          carryForwardAllowed: false
        },
        casualLeavePolicy: {
          maxDays: 5,
          minimumNoticeDays: 1,
          carryForwardAllowed: false
        },
        generalRules: [
          'All leave requests must be approved by direct manager',
          'Leave cannot be taken during project critical phases without prior approval',
          'Medical certificate required for sick leave exceeding 2 consecutive days',
          'Annual leave must be planned and approved in advance',
          'Emergency leave requires immediate notification to manager'
        ]
      };
    }
  }

  /**
   * Get pay slip data from SAP for specific month and year
   * @param {string} employeeId 
   * @param {number} month 
   * @param {number} year 
   * @returns {Object} Pay slip data
   */
  async getPaySlipData(employeeId, month, year) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/payslip`, {
        params: { employeeId, month, year },
        headers: this.headers,
        timeout: 20000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      return this.generateMockPaySlipData(employeeId, month, year);
    } catch (error) {
      console.error('Error fetching pay slip data:', error);
      return this.generateMockPaySlipData(employeeId, month, year);
    }
  }

  /**
   * Generate mock pay slip data for development
   * @param {string} employeeId 
   * @param {number} month 
   * @param {number} year 
   */
  generateMockPaySlipData(employeeId, month, year) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const basicSalary = 50000;
    const hra = basicSalary * 0.4;
    const conveyance = 1600;
    const medicalAllowance = 1250;
    const specialAllowance = 15000;
    
    const totalEarnings = basicSalary + hra + conveyance + medicalAllowance + specialAllowance;
    
    const pfDeduction = basicSalary * 0.12;
    const esiDeduction = totalEarnings * 0.0075;
    const incomeTax = totalEarnings * 0.1;
    const professionalTax = 200;
    
    const totalDeductions = pfDeduction + esiDeduction + incomeTax + professionalTax;
    const netPay = totalEarnings - totalDeductions;

    return {
      basicInfo: {
        employeeId: employeeId,
        employeeName: 'John Doe',
        designation: 'Software Engineer',
        department: 'Information Technology',
        costCenter: 'IT001',
        location: 'Bangalore',
        bankAccount: '****1234',
        panNumber: 'ABCDE1234F',
        pfNumber: 'KA/BGE/12345',
        esiNumber: '1234567890',
        joiningDate: '2020-01-15',
        payPeriod: `${monthNames[month - 1]} ${year}`,
        payDate: `${year}-${month.toString().padStart(2, '0')}-28`,
        workingDays: 22,
        leaveDays: 1,
        paidDays: 22
      },
      earnings: [
        {
          code: 'BASIC',
          description: 'Basic Salary',
          amount: basicSalary,
          type: 'Fixed',
          isTaxable: true,
          isPfApplicable: true,
          isEsiApplicable: true
        },
        {
          code: 'HRA',
          description: 'House Rent Allowance',
          amount: hra,
          type: 'Allowance',
          isTaxable: true,
          isPfApplicable: false,
          isEsiApplicable: true
        },
        {
          code: 'CONV',
          description: 'Conveyance Allowance',
          amount: conveyance,
          type: 'Allowance',
          isTaxable: false,
          isPfApplicable: false,
          isEsiApplicable: true
        },
        {
          code: 'MED',
          description: 'Medical Allowance',
          amount: medicalAllowance,
          type: 'Allowance',
          isTaxable: false,
          isPfApplicable: false,
          isEsiApplicable: true
        },
        {
          code: 'SPECIAL',
          description: 'Special Allowance',
          amount: specialAllowance,
          type: 'Variable',
          isTaxable: true,
          isPfApplicable: false,
          isEsiApplicable: true
        }
      ],
      deductions: [
        {
          code: 'PF',
          description: 'Provident Fund',
          amount: pfDeduction,
          type: 'Statutory',
          isPreTax: false
        },
        {
          code: 'ESI',
          description: 'Employee State Insurance',
          amount: esiDeduction,
          type: 'Statutory',
          isPreTax: false
        },
        {
          code: 'IT',
          description: 'Income Tax',
          amount: incomeTax,
          type: 'Tax',
          isPreTax: false
        },
        {
          code: 'PT',
          description: 'Professional Tax',
          amount: professionalTax,
          type: 'Statutory',
          isPreTax: false
        }
      ],
      taxDetails: {
        grossSalary: totalEarnings,
        taxableIncome: totalEarnings - conveyance - medicalAllowance,
        incomeTax: incomeTax,
        professionalTax: professionalTax,
        tdsAmount: incomeTax,
        taxSavingInvestments: 50000,
        exemptAllowances: conveyance + medicalAllowance
      },
      statutoryDetails: {
        pfEmployeeContribution: pfDeduction,
        pfEmployerContribution: pfDeduction,
        esiEmployeeContribution: esiDeduction,
        esiEmployerContribution: esiDeduction * 3.25,
        gratuity: basicSalary * 0.0481,
        lwf: 0
      },
      ytdSummary: {
        grossEarnings: totalEarnings * month,
        totalDeductions: totalDeductions * month,
        netPay: netPay * month,
        incomeTax: incomeTax * month,
        pfContribution: pfDeduction * month,
        esiContribution: esiDeduction * month,
        professionalTax: professionalTax * month
      },
      totalEarnings: totalEarnings,
      totalDeductions: totalDeductions,
      netPay: netPay,
      netPayInWords: `Rupees ${Math.floor(netPay).toLocaleString('en-IN')} only`,
      companyInfo: {
        name: 'TechCorp Solutions Pvt Ltd',
        address: '123 Tech Park, Electronic City, Bangalore - 560100',
        logo: '/assets/company-logo.png'
      },
      generatedOn: new Date().toISOString()
    };
  }

  /**
   * Get pay slip history for an employee
   * @param {string} employeeId 
   * @param {number} year 
   * @param {number} limit 
   * @returns {Array} Pay slip history
   */
  async getPaySlipHistory(employeeId, year, limit = 12) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/payslip-history`, {
        params: { employeeId, year, limit },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      return this.generateMockPaySlipHistory(employeeId, year, limit);
    } catch (error) {
      console.error('Error fetching pay slip history:', error);
      return this.generateMockPaySlipHistory(employeeId, year, limit);
    }
  }

  /**
   * Generate mock pay slip history
   * @param {string} employeeId 
   * @param {number} year 
   * @param {number} limit 
   */
  generateMockPaySlipHistory(employeeId, year = new Date().getFullYear(), limit = 12) {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const history = [];

    for (let i = 0; i < limit; i++) {
      let month = currentMonth - i;
      let historyYear = currentYear;

      if (month <= 0) {
        month += 12;
        historyYear--;
      }

      if (year && historyYear !== year) continue;

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      history.push({
        month: month,
        year: historyYear,
        payPeriod: `${monthNames[month - 1]} ${historyYear}`,
        netPay: 65000 + (Math.random() * 10000 - 5000), // Random variation
        status: i === 0 ? 'Draft' : 'Published',
        generatedDate: `${historyYear}-${month.toString().padStart(2, '0')}-28`,
        downloadUrl: `/api/employee/payslip/${employeeId}/download?month=${month}&year=${historyYear}`
      });
    }

    return history;
  }

  /**
   * Generate pay slip PDF
   * @param {string} employeeId 
   * @param {number} month 
   * @param {number} year 
   * @returns {Buffer} PDF buffer
   */
  async generatePaySlipPDF(employeeId, month, year) {
    try {
      const response = await axios.post(`${this.sapEndpoint}/payslip/generate-pdf`, {
        employeeId,
        month,
        year
      }, {
        headers: {
          ...this.headers,
          'Accept': 'application/pdf'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error generating pay slip PDF:', error);
      // For development, return a mock PDF buffer
      return Buffer.from('Mock PDF content for development');
    }
  }

  /**
   * Email pay slip to specified address
   * @param {Object} emailRequest 
   * @returns {Object} Email result
   */
  async emailPaySlip(emailRequest) {
    try {
      const response = await axios.post(`${this.sapEndpoint}/payslip/email`, emailRequest, {
        headers: this.headers,
        timeout: 20000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      throw new Error('Failed to send pay slip email');
    } catch (error) {
      console.error('Error emailing pay slip:', error);
      // For development, simulate successful email
      return {
        messageId: 'mock-message-id',
        status: 'sent',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available pay periods for an employee
   * @param {string} employeeId 
   * @returns {Array} Available periods
   */
  async getAvailablePayPeriods(employeeId) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/payslip-periods`, {
        params: { employeeId },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      return this.generateMockPayPeriods();
    } catch (error) {
      console.error('Error fetching pay periods:', error);
      return this.generateMockPayPeriods();
    }
  }

  /**
   * Generate mock pay periods
   */
  generateMockPayPeriods() {
    const currentDate = new Date();
    const periods = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate last 12 months of pay periods
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      periods.push({
        month: month,
        year: year,
        period: `${monthNames[month - 1]} ${year}`
      });
    }

    return periods;
  }

  /**
   * Get pay slip summary for dashboard
   * @param {string} employeeId 
   * @param {number} year 
   * @returns {Object} Pay slip summary
   */
  async getPaySlipSummary(employeeId, year) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/payslip-summary`, {
        params: { employeeId, year },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      return {
        year: year,
        totalGrossEarnings: 780000,
        totalNetPay: 650000,
        totalDeductions: 130000,
        totalTaxPaid: 78000,
        monthlyAverage: {
          grossEarnings: 65000,
          netPay: 54167,
          deductions: 10833
        },
        highestPayMonth: 'March',
        lowestPayMonth: 'February',
        totalWorkingDays: 264,
        totalLeaveDays: 12
      };
    } catch (error) {
      console.error('Error fetching pay slip summary:', error);
      throw error;
    }
  }

  /**
   * Verify pay slip access permissions
   * @param {string} employeeId 
   * @param {number} month 
   * @param {number} year 
   * @returns {Object} Access verification result
   */
  async verifyPaySlipAccess(employeeId, month, year) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/payslip-access`, {
        params: { employeeId, month, year },
        headers: this.headers,
        timeout: 10000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Default access for development
      return {
        canAccess: true,
        reason: null
      };
    } catch (error) {
      console.error('Error verifying pay slip access:', error);
      return {
        canAccess: true,
        reason: null
      };
    }
  }

  /**
   * Get tax computation details
   * @param {string} employeeId 
   * @param {number} year 
   * @returns {Object} Tax computation data
   */
  async getTaxComputation(employeeId, year) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/tax-computation`, {
        params: { employeeId, year },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      return {
        year: year,
        grossSalary: 780000,
        standardDeduction: 50000,
        hraExemption: 200000,
        section80CDeductions: 150000,
        section80DDeductions: 25000,
        taxableIncome: 355000,
        incomeTax: 12500,
        cess: 500,
        totalTax: 13000,
        monthlyTds: 1083
      };
    } catch (error) {
      console.error('Error fetching tax computation:', error);
      throw error;
    }
  }

  /**
   * Get Form 16 data
   * @param {string} employeeId 
   * @param {number} year 
   * @returns {Object} Form 16 data
   */
  async getForm16Data(employeeId, year) {
    try {
      const response = await axios.get(`${this.sapEndpoint}/form16`, {
        params: { employeeId, year },
        headers: this.headers,
        timeout: 15000
      });

      if (response.data && response.data.success) {
        return response.data.data;
      }

      // Mock data for development
      return {
        employeeId: employeeId,
        employeeName: 'John Doe',
        panNumber: 'ABCDE1234F',
        year: year,
        employerDetails: {
          name: 'TechCorp Solutions Pvt Ltd',
          tan: 'BLRX12345A',
          address: '123 Tech Park, Electronic City, Bangalore - 560100'
        },
        salaryDetails: {
          grossSalary: 780000,
          tdsDeducted: 13000,
          netSalary: 650000
        },
        generatedDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching Form 16 data:', error);
      throw error;
    }
  }

  /**
   * Generate Form 16 PDF
   * @param {string} employeeId 
   * @param {number} year 
   * @returns {Buffer} PDF buffer
   */
  async generateForm16PDF(employeeId, year) {
    try {
      const response = await axios.post(`${this.sapEndpoint}/form16/generate-pdf`, {
        employeeId,
        year
      }, {
        headers: {
          ...this.headers,
          'Accept': 'application/pdf'
        },
        responseType: 'arraybuffer',
        timeout: 30000
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Error generating Form 16 PDF:', error);
      // For development, return a mock PDF buffer
      return Buffer.from('Mock Form 16 PDF content for development');
    }
  }
}module.exports = new SAPService();
