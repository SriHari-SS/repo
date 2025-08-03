const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sapService = require('../services/sapService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Multer configuration for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.employee.employeeId}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (mimeType && extName) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * @route GET /api/employee/profile
 * @desc Get employee profile information
 * @access Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.employee.employeeId;
    const employeeDetails = await sapService.getEmployeeDetails(employeeId);
    
    res.status(200).json({
      success: true,
      data: employeeDetails
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching employee profile'
    });
  }
});

/**
 * @route GET /api/employee/payslip/:month/:year
 * @desc Get employee payslip for specific month/year
 * @access Private
 */
router.get('/payslip/:month/:year', authenticateToken, async (req, res) => {
  try {
    const { month, year } = req.params;
    const employeeId = req.employee.employeeId;
    
    const payslip = await sapService.getPayslip(employeeId, month, year);
    
    res.status(200).json({
      success: true,
      data: payslip
    });
  } catch (error) {
    console.error('Error fetching payslip:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payslip'
    });
  }
});

/**
 * @route GET /api/employee/leave-balance
 * @desc Get employee leave balance
 * @access Private
 */
router.get('/leave-balance', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.employee.employeeId;
    const leaveBalance = await sapService.getLeaveBalance(employeeId);
    
    res.status(200).json({
      success: true,
      data: leaveBalance
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leave balance'
    });
  }
});

/**
 * @route POST /api/employee/leave-request
 * @desc Submit leave request
 * @access Private
 */
router.post('/leave-request', authenticateToken, async (req, res) => {
  try {
    const employeeId = req.employee.employeeId;
    const leaveRequest = req.body;
    
    const result = await sapService.submitLeaveRequest(employeeId, leaveRequest);
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Leave request submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting leave request'
    });
  }
});

/**
 * @route GET /api/employee/profile/:employeeId
 * @desc Get comprehensive employee profile data
 * @access Private
 */
router.get('/profile/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Validate if user is authorized to view this profile
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this profile'
      });
    }

    // Fetch comprehensive employee data from SAP
    const profileData = await sapService.getEmployeeProfileData(employeeId);
    
    if (!profileData) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    res.json({
      success: true,
      data: profileData,
      lastSyncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee profile',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/employee/profile/:employeeId
 * @desc Update employee profile data
 * @access Private
 */
router.put('/profile/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updateData = req.body;

    // Validate if user is authorized to update this profile
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this profile'
      });
    }

    // Update profile data in SAP
    const updatedProfile = await sapService.updateEmployeeProfile(employeeId, updateData);

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found or update failed'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });

  } catch (error) {
    console.error('Error updating employee profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee profile',
      error: error.message
    });
  }
});

/**
 * @route POST /api/employee/profile/:employeeId/photo
 * @desc Upload employee photo
 * @access Private
 */
router.post('/profile/:employeeId/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Validate if user is authorized to update this profile
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this profile photo'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file provided'
      });
    }

    const photoUrl = `/uploads/profiles/${req.file.filename}`;

    // Update photo URL in SAP
    const updatedProfile = await sapService.updateEmployeePhoto(employeeId, photoUrl);

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update employee photo in SAP'
      });
    }

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl: photoUrl
    });

  } catch (error) {
    console.error('Error uploading employee photo:', error);
    
    // Delete uploaded file if SAP update failed
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/profiles', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload photo',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/profile/:employeeId/attendance
 * @desc Get employee attendance summary
 * @access Private
 */
router.get('/profile/:employeeId/attendance', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, month } = req.query;

    // Validate if user is authorized to view this data
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view attendance data'
      });
    }

    const attendanceData = await sapService.getEmployeeAttendance(employeeId, year, month);

    res.json({
      success: true,
      data: attendanceData
    });

  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/profile/:employeeId/payslips
 * @desc Get employee payslips
 * @access Private
 */
router.get('/profile/:employeeId/payslips', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, limit = 12 } = req.query;

    // Validate if user is authorized to view this data
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view payslip data'
      });
    }

    const payslips = await sapService.getEmployeePayslips(employeeId, year, limit);

    res.json({
      success: true,
      data: payslips
    });

  } catch (error) {
    console.error('Error fetching payslips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payslips',
      error: error.message
    });
  }
});

/**
 * @route POST /api/employee/profile/:employeeId/refresh
 * @desc Refresh employee data from SAP
 * @access Private
 */
router.post('/profile/:employeeId/refresh', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Validate if user is authorized to refresh this profile
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to refresh this profile'
      });
    }

    // Force refresh data from SAP
    const refreshedData = await sapService.refreshEmployeeData(employeeId);

    if (!refreshedData) {
      return res.status(404).json({
        success: false,
        message: 'Failed to refresh employee data'
      });
    }

    res.json({
      success: true,
      message: 'Employee data refreshed successfully',
      data: refreshedData,
      lastSyncTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error refreshing employee data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh employee data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/leave-types
 * @desc Get all available leave types from SAP
 * @access Private
 */
router.get('/leave-types', authenticateToken, async (req, res) => {
  try {
    const leaveTypes = await sapService.getLeaveTypes();
    
    res.json({
      success: true,
      data: leaveTypes
    });
  } catch (error) {
    console.error('Error fetching leave types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave types',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/leave-balance/:employeeId
 * @desc Get employee leave balance for a specific year
 * @access Private
 */
router.get('/leave-balance/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view leave balance'
      });
    }

    const leaveBalance = await sapService.getLeaveBalance(employeeId, year);
    
    res.json({
      success: true,
      data: leaveBalance
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave balance',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/leave-history/:employeeId
 * @desc Get comprehensive leave history with filtering and sorting
 * @access Private
 */
router.get('/leave-history/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      leaveType,
      status,
      fromDate,
      toDate,
      year,
      month,
      page = 1,
      limit = 50,
      sortField = 'appliedDate',
      sortDirection = 'desc'
    } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view leave history'
      });
    }

    const filters = {
      employeeId,
      leaveType,
      status,
      fromDate,
      toDate,
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined
    };

    const sort = {
      field: sortField,
      direction: sortDirection
    };

    const leaveReport = await sapService.getLeaveHistory(
      filters,
      sort,
      parseInt(page),
      parseInt(limit)
    );
    
    res.json({
      success: true,
      data: leaveReport
    });
  } catch (error) {
    console.error('Error fetching leave history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave history',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/leave-requests/:employeeId
 * @desc Get employee leave requests
 * @access Private
 */
router.get('/leave-requests/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, year } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view leave requests'
      });
    }

    const leaveRequests = await sapService.getLeaveRequests(employeeId, status, year);
    
    res.json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/leave-calendar/:employeeId
 * @desc Get leave calendar for a specific month/year
 * @access Private
 */
router.get('/leave-calendar/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, month } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view leave calendar'
      });
    }

    const calendarData = await sapService.getLeaveCalendar(
      employeeId,
      parseInt(year),
      parseInt(month)
    );
    
    res.json({
      success: true,
      data: calendarData
    });
  } catch (error) {
    console.error('Error fetching leave calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave calendar',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/leave-summary/:employeeId
 * @desc Get leave summary and analytics
 * @access Private
 */
router.get('/leave-summary/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view leave summary'
      });
    }

    const leaveSummary = await sapService.getLeaveSummary(employeeId, year);
    
    res.json({
      success: true,
      data: leaveSummary
    });
  } catch (error) {
    console.error('Error fetching leave summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave summary',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/employee/leave-request/:requestId/cancel
 * @desc Cancel a leave request
 * @access Private
 */
router.put('/leave-request/:requestId/cancel', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason } = req.body;

    const result = await sapService.cancelLeaveRequest(requestId, reason, req.employee.employeeId);
    
    res.json({
      success: true,
      message: 'Leave request cancelled successfully',
      data: result
    });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel leave request',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/leave-report/:employeeId/export
 * @desc Export leave report in various formats
 * @access Private
 */
router.get('/leave-report/:employeeId/export', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      format = 'excel',
      leaveType,
      status,
      fromDate,
      toDate,
      year,
      month,
      sortField = 'appliedDate',
      sortDirection = 'desc'
    } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to export leave report'
      });
    }

    const filters = {
      employeeId,
      leaveType,
      status,
      fromDate,
      toDate,
      year: year ? parseInt(year) : undefined,
      month: month ? parseInt(month) : undefined
    };

    const sort = {
      field: sortField,
      direction: sortDirection
    };

    const reportBuffer = await sapService.exportLeaveReport(filters, sort, format);
    
    // Set appropriate headers for file download
    const fileName = `leave-report-${employeeId}-${new Date().toISOString().split('T')[0]}.${format}`;
    
    let contentType = 'application/octet-stream';
    if (format === 'pdf') contentType = 'application/pdf';
    else if (format === 'excel') contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (format === 'csv') contentType = 'text/csv';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(reportBuffer);
    
  } catch (error) {
    console.error('Error exporting leave report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export leave report',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/calculate-working-days
 * @desc Calculate working days between two dates
 * @access Private
 */
router.get('/calculate-working-days', authenticateToken, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: 'Both fromDate and toDate are required'
      });
    }

    const workingDays = await sapService.calculateWorkingDays(fromDate, toDate);
    
    res.json({
      success: true,
      data: { workingDays }
    });
  } catch (error) {
    console.error('Error calculating working days:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate working days',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/leave-policy
 * @desc Get company leave policy
 * @access Private
 */
router.get('/leave-policy', authenticateToken, async (req, res) => {
  try {
    const leavePolicy = await sapService.getLeavePolicy();
    
    res.json({
      success: true,
      data: leavePolicy
    });
  } catch (error) {
    console.error('Error fetching leave policy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave policy',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/payslip/:employeeId
 * @desc Get pay slip data for specific month and year from SAP
 * @access Private
 */
router.get('/payslip/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view pay slip'
      });
    }

    // Validate required parameters
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    const paySlipData = await sapService.getPaySlipData(employeeId, parseInt(month), parseInt(year));
    
    res.json({
      success: true,
      data: paySlipData
    });
  } catch (error) {
    console.error('Error fetching pay slip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pay slip data',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/payslip-history/:employeeId
 * @desc Get pay slip history for an employee
 * @access Private
 */
router.get('/payslip-history/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, limit = 12 } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view pay slip history'
      });
    }

    const paySlipHistory = await sapService.getPaySlipHistory(employeeId, year ? parseInt(year) : undefined, parseInt(limit));
    
    res.json({
      success: true,
      data: paySlipHistory
    });
  } catch (error) {
    console.error('Error fetching pay slip history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pay slip history',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/payslip/:employeeId/download
 * @desc Download pay slip as PDF
 * @access Private
 */
router.get('/payslip/:employeeId/download', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year, format = 'pdf' } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to download pay slip'
      });
    }

    // Validate required parameters
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    const pdfBuffer = await sapService.generatePaySlipPDF(employeeId, parseInt(month), parseInt(year));
    
    // Set appropriate headers for file download
    const fileName = `PaySlip_${employeeId}_${month}_${year}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error downloading pay slip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download pay slip',
      error: error.message
    });
  }
});

/**
 * @route POST /api/employee/payslip/email
 * @desc Email pay slip to specified email address
 * @access Private
 */
router.post('/payslip/email', authenticateToken, async (req, res) => {
  try {
    const { employeeId, month, year, emailAddress, subject, message } = req.body;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to email pay slip'
      });
    }

    // Validate required parameters
    if (!employeeId || !month || !year || !emailAddress) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, month, year, and email address are required'
      });
    }

    const result = await sapService.emailPaySlip({
      employeeId,
      month: parseInt(month),
      year: parseInt(year),
      emailAddress,
      subject,
      message
    });
    
    res.json({
      success: true,
      message: 'Pay slip emailed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error emailing pay slip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to email pay slip',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/payslip-periods/:employeeId
 * @desc Get available pay periods for an employee
 * @access Private
 */
router.get('/payslip-periods/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view pay periods'
      });
    }

    const payPeriods = await sapService.getAvailablePayPeriods(employeeId);
    
    res.json({
      success: true,
      data: payPeriods
    });
  } catch (error) {
    console.error('Error fetching pay periods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pay periods',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/payslip-summary/:employeeId
 * @desc Get pay slip summary for dashboard
 * @access Private
 */
router.get('/payslip-summary/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view pay slip summary'
      });
    }

    const summary = await sapService.getPaySlipSummary(employeeId, year ? parseInt(year) : new Date().getFullYear());
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching pay slip summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pay slip summary',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/payslip-access/:employeeId
 * @desc Verify pay slip access permissions
 * @access Private
 */
router.get('/payslip-access/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to check pay slip access'
      });
    }

    const accessInfo = await sapService.verifyPaySlipAccess(employeeId, parseInt(month), parseInt(year));
    
    res.json({
      success: true,
      canAccess: accessInfo.canAccess,
      reason: accessInfo.reason
    });
  } catch (error) {
    console.error('Error verifying pay slip access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify pay slip access',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/tax-computation/:employeeId
 * @desc Get tax computation details
 * @access Private
 */
router.get('/tax-computation/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view tax computation'
      });
    }

    const taxComputation = await sapService.getTaxComputation(employeeId, year ? parseInt(year) : new Date().getFullYear());
    
    res.json({
      success: true,
      data: taxComputation
    });
  } catch (error) {
    console.error('Error fetching tax computation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tax computation',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/form16/:employeeId
 * @desc Get Form 16 data
 * @access Private
 */
router.get('/form16/:employeeId', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view Form 16'
      });
    }

    const form16Data = await sapService.getForm16Data(employeeId, year ? parseInt(year) : new Date().getFullYear());
    
    res.json({
      success: true,
      data: form16Data
    });
  } catch (error) {
    console.error('Error fetching Form 16:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Form 16',
      error: error.message
    });
  }
});

/**
 * @route GET /api/employee/form16/:employeeId/download
 * @desc Download Form 16 as PDF
 * @access Private
 */
router.get('/form16/:employeeId/download', authenticateToken, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year, format = 'pdf' } = req.query;

    // Validate authorization
    if (req.employee.employeeId !== employeeId && req.employee.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to download Form 16'
      });
    }

    const pdfBuffer = await sapService.generateForm16PDF(employeeId, year ? parseInt(year) : new Date().getFullYear());
    
    // Set appropriate headers for file download
    const fileName = `Form16_${employeeId}_${year || new Date().getFullYear()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('Error downloading Form 16:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download Form 16',
      error: error.message
    });
  }
});

module.exports = router;
