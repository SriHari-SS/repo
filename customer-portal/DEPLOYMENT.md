# 🚀 Customer Portal - SAP Integration Deployment Guide

## 📋 Overview
This Customer Portal is configured to connect to your SAP system using SOAP web services with your specific credentials.

## 🔧 SAP Configuration
- **Server**: AZKTLDS5CP.kcloud.com:8000
- **Service**: /sap/bc/srt/scs/sap/zfy_portal_service
- **Client**: 100
- **Username**: K901703
- **Function**: ZFY_PORTAL_1

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start Services
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
ng serve
```

### 3. Test SAP Connection
```bash
# Check backend health
curl http://localhost:3000/health

# Check SAP configuration
curl http://localhost:3000/api/sap-test

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"customerId": "0000000003", "password": "12345"}'
```

## 🌐 Access URLs
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **SAP Test**: http://localhost:3000/api/sap-test

## 🔐 Test Credentials
- **Customer ID**: 0000000003
- **Password**: 12345

## 📁 Key Files
- `backend/src/services/sapWebService.js` - SAP SOAP integration
- `backend/src/routes/auth.js` - Authentication routes
- `backend/src/routes/customer.js` - Customer data routes
- `backend/.env.production` - Production environment variables

## 🎨 Features
✅ **Dark Dashboard Theme** - Glass morphism design
✅ **Financial Sheet** - Matching dark theme
✅ **SAP Authentication** - Real SOAP integration
✅ **Empty State Handling** - Professional UI
✅ **Responsive Design** - Mobile compatible
✅ **Print Support** - Financial reports

## 🔍 Troubleshooting

### SAP Connection Issues
1. Verify network connectivity to AZKTLDS5CP.kcloud.com
2. Check SAP credentials in console logs
3. Verify SOAP response format matches expected structure

### Frontend Issues
1. Check browser console for errors
2. Verify backend is running on port 3000
3. Check CORS configuration in backend

### Backend Issues
1. Check console logs for SAP connection status
2. Verify all environment variables are set
3. Test individual API endpoints

## 📝 Console Output
When starting, you should see:
```
🚀 Customer Portal Backend Starting...
🌍 Environment: production
📡 SAP URL: http://AZKTLDS5CP.kcloud.com:8000
🔑 SAP User: K901703
🏢 SAP Client: 100
🔗 SAP Web Service initialized
📡 SAP URL: http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfy_portal_service
🔑 Username: K901703
✅ Server running on port 3000
```

## 🚀 Production Deployment
1. Set `NODE_ENV=production`
2. Use proper domain in CORS settings
3. Configure HTTPS if needed
4. Set up proper logging
