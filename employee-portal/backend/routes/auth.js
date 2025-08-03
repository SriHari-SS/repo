const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sapService = require('../services/sapService');
const { validateEmployeeCredentials } = require('../middleware/validation');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many login attempts, please try again later',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/auth/login
 * @desc Authenticate employee with SAP ERP system
 * @access Public
 */
router.post('/login', loginLimiter, validateEmployeeCredentials, async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    console.log(`Login attempt for Employee ID: ${employeeId}`);

    // Step 1: Validate Employee ID format
    if (!employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID and password are required'
      });
    }

    // Step 2: Check if Employee ID exists in SAP standard table
    const employeeExists = await sapService.checkEmployeeExists(employeeId);
    
    if (!employeeExists.success) {
      console.log(`Employee ID ${employeeId} not found in SAP standard table`);
      return res.status(401).json({
        success: false,
        message: 'Invalid Employee ID or password'
      });
    }

    // Step 3: Validate credentials in SAP custom Z-table via SAP PO interface
    const authResult = await sapService.authenticateEmployee(employeeId, password);
    
    if (!authResult.success) {
      console.log(`Authentication failed for Employee ID: ${employeeId}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid Employee ID or password'
      });
    }

    // Step 4: Get employee details from SAP
    const employeeDetails = await sapService.getEmployeeDetails(employeeId);

    // Step 5: Generate JWT token
    const token = jwt.sign(
      { 
        employeeId: employeeId,
        name: employeeDetails.name,
        department: employeeDetails.department,
        role: employeeDetails.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log(`Successful login for Employee ID: ${employeeId}`);

    // Step 6: Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        employee: {
          employeeId: employeeDetails.employeeId,
          name: employeeDetails.name,
          email: employeeDetails.email,
          department: employeeDetails.department,
          designation: employeeDetails.designation,
          role: employeeDetails.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Logout employee (client-side token removal)
 * @access Private
 */
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is typically handled client-side
  // by removing the token. However, we can log the logout event.
  console.log('Employee logout requested');
  
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * @route GET /api/auth/verify
 * @desc Verify JWT token validity
 * @access Private
 */
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        employeeId: decoded.employeeId,
        name: decoded.name,
        department: decoded.department,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;
