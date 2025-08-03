const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const sapService = require('../services/sapService');

const router = express.Router();

// Login validation middleware
const validateLogin = [
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Customer ID must be between 3 and 20 characters')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('Customer ID can only contain letters, numbers, underscores, and hyphens'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password must be at least 1 character long')
];

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate customer with SAP ERP system
 * @access  Public
 */
router.post('/login', validateLogin, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { customerId, password } = req.body;

    console.log(`Login attempt for Customer ID: ${customerId}`);

    // Step 1: Check if Customer-ID exists in SAP standard table
    const customerExists = await sapService.checkCustomerExists(customerId);
    
    if (!customerExists.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Customer ID or Password',
        details: 'Customer ID not found in system'
      });
    }

    // Step 2: Validate Customer-ID and Password in SAP custom Z-table
    const authResult = await sapService.authenticateCustomer(customerId, password);

    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Customer ID or Password',
        details: authResult.message
      });
    }

    // Step 3: Generate JWT token for successful authentication
    const tokenPayload = {
      customerId: customerId,
      customerName: authResult.customerData.name,
      loginTime: new Date().toISOString()
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    // Log successful login
    console.log(`Successful login for Customer ID: ${customerId}`);

    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      customerData: {
        customerId: customerId,
        name: authResult.customerData.name,
        email: authResult.customerData.email,
        company: authResult.customerData.company
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Authentication failed'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout customer (client-side token removal)
 * @access  Private
 */
router.post('/logout', (req, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // Here we can log the logout event
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Customer ${decoded.customerId} logged out`);
    } catch (error) {
      console.log('Invalid token during logout');
    }
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token validity
 * @access  Private
 */
router.get('/verify', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      message: 'Token is valid',
      customerData: {
        customerId: decoded.customerId,
        customerName: decoded.customerName
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

module.exports = router;
