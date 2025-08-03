const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');

const app = express();
const PORT = process.env.PORT || 3000;

// Console startup info
console.log('🚀 Customer Portal Backend Starting...');
console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
console.log('📡 SAP URL:', process.env.SAP_BASE_URL || 'http://AZKTLDS5CP.kcloud.com:8000');
console.log('🔑 SAP User:', process.env.SAP_USER || 'K901703');
console.log('🏢 SAP Client:', process.env.SAP_CLIENT || '100');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:4200',
    'http://localhost:4201'
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Customer Portal Backend is running',
    timestamp: new Date().toISOString(),
    sap: {
      url: process.env.SAP_BASE_URL || 'http://AZKTLDS5CP.kcloud.com:8000',
      client: process.env.SAP_CLIENT || '100',
      user: process.env.SAP_USER || 'K901703'
    }
  });
});

// SAP Connection Test Endpoint
app.get('/api/sap-test', (req, res) => {
  const SAPWebService = require('./services/sapWebService');
  const sapService = new SAPWebService();
  
  res.json({
    message: 'SAP Configuration Ready',
    config: {
      baseUrl: sapService.config.baseUrl,
      serviceEndpoint: sapService.config.serviceEndpoint,
      client: sapService.config.client,
      username: sapService.config.username,
      fullUrl: `${sapService.config.baseUrl}${sapService.config.serviceEndpoint}?sap-client=${sapService.config.client}`
    },
    instructions: 'Use POST /api/auth/login with customerId: "0000000003" and password: "12345" to test authentication'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Customer Portal Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
