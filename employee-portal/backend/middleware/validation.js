/**
 * Validation middleware for employee credentials
 */
const validateEmployeeCredentials = (req, res, next) => {
  const { employeeId, password } = req.body;

  // Validate Employee ID format
  if (!employeeId || typeof employeeId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Valid Employee ID is required'
    });
  }

  // Employee ID format validation (flexible format for both Employee IDs and emails)
  if (employeeId.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Employee ID must be at least 3 characters long'
    });
  }

  // Validate password
  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Password is required'
    });
  }

  // Password strength validation
  if (password.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 3 characters long'
    });
  }

  next();
};

/**
 * Validation middleware for leave request
 */
const validateLeaveRequest = (req, res, next) => {
  const { leaveType, startDate, endDate, reason } = req.body;

  if (!leaveType || !startDate || !endDate || !reason) {
    return res.status(400).json({
      success: false,
      message: 'Leave type, start date, end date, and reason are required'
    });
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format. Use YYYY-MM-DD'
    });
  }

  // Validate date logic
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    return res.status(400).json({
      success: false,
      message: 'Start date cannot be in the past'
    });
  }

  if (end < start) {
    return res.status(400).json({
      success: false,
      message: 'End date cannot be before start date'
    });
  }

  next();
};

/**
 * Sanitize input data
 */
const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags and trim whitespace
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<[^>]*>?/gm, '').trim();
      }
    });
  }
  
  next();
};

module.exports = {
  validateEmployeeCredentials,
  validateLeaveRequest,
  sanitizeInput
};
