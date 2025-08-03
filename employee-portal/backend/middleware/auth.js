const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, employee) => {
    if (err) {
      console.error('Token verification failed:', err.message);
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.employee = employee;
    next();
  });
};

/**
 * Middleware to check if user has specific role
 */
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.employee) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.employee.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};
