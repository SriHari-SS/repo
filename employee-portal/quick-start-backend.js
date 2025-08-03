// Quick Backend Starter
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Employee Portal Backend...');

// Set environment variables
process.env.NODE_ENV = 'development';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'employee-portal-super-secret-key-2024';
process.env.JWT_EXPIRES_IN = '7d';
process.env.FRONTEND_URL = 'http://localhost:4200';

// Change to backend directory
const backendDir = '/Users/srihariharans/Documents/workitems/bhava2/employee-portal/backend';
process.chdir(backendDir);

console.log(`📂 Working directory: ${process.cwd()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
console.log(`🔧 Port: ${process.env.PORT}`);

// Start the server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: process.env
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

server.on('exit', (code) => {
  console.log(`🛑 Server exited with code ${code}`);
});

console.log('✅ Backend server starting...');
console.log('🌐 Server will be available at: http://localhost:3001');
console.log('🔍 Health check: http://localhost:3001/health');
console.log('');
console.log('🔑 Demo Credentials:');
console.log('   Employee ID: EMP001');
console.log('   Password:    password123');
