# Customer Portal with SAP Integration

A modern, full-stack customer portal application with Angular frontend and Node.js backend that integrates with SAP ERP system using SOAP web services for real-time customer authentication and data management.

## ✨ Features

### 🎨 Frontend (Angular 20+)
- **Secure Customer Login**: Customer-ID and Password authentication with SAP validation
- **Interactive Dashboard**: Real-time business metrics, KPIs, and data visualization
- **Customer Profile Management**: Complete profile information with editable fields
- **Financial Statements**: Detailed financial data and transaction history
- **Responsive Design**: Modern, mobile-first interface with consistent design system
- **Clickable Navigation**: Enhanced UX with metric cards linking to detailed views
- **JWT Authentication**: Secure token-based session management
- **Comprehensive Error Handling**: User-friendly error messages and loading states

### 🚀 Backend (Node.js + Express)
- **SAP SOAP Integration**: Real-time connectivity to SAP ERP using SOAP web services
- **Enhanced Authentication**: Multi-step validation using ZFY_PORTAL_1 function
- **Complete Data Management**: Orders, inquiries, deliveries, and financial data
- **Security Features**: Helmet.js, CORS, rate limiting, and input validation
- **RESTful API**: Clean, well-documented API endpoints
- **Development Mode**: Comprehensive mock data for testing without SAP connection
- **Error Recovery**: Automatic fallback mechanisms and retry logic

## 🛠️ Technology Stack

### Frontend
- **Angular 20+** - Modern web framework with TypeScript
- **SCSS** - Advanced styling with CSS custom properties
- **RxJS** - Reactive programming for HTTP requests
- **Angular Router** - Client-side routing with guards
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SAP SOAP Integration** - Real-time data via SOAP web services
- **JWT (JSON Web Tokens)** - Secure authentication
- **Helmet.js** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API request throttling
- **Axios** - HTTP client for SAP integration
- **xml2js** - XML parsing for SOAP responses

### SAP Integration
- **SOAP Web Services** - `http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zfy_portal_service`
- **ZFY_PORTAL_1 Function** - Custom SAP authentication function
- **Real-time Data Sync** - Live customer data retrieval

## 📁 Project Structure

```
customer-portal/
├── frontend/                 # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/    # UI components (login, dashboard, profile, financial)
│   │   │   ├── services/      # Authentication and customer services
│   │   │   ├── guards/        # Route protection and authentication
│   │   │   ├── models/        # TypeScript interfaces and types
│   │   │   └── app.routes.ts  # Application routing configuration
│   │   ├── styles.scss        # Global CSS variables and styles
│   │   └── index.html
│   ├── package.json
│   └── angular.json
└── backend/                  # Node.js API server
    ├── src/
    │   ├── routes/           # API route handlers (auth, customer)
    │   ├── services/         # SAP SOAP service integration
    │   ├── middleware/       # Authentication and security middleware
    │   └── app.js            # Express application entry point
    ├── .env.example          # Environment variables template
    └── package.json

## 📋 Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- SAP ERP system with Web Services enabled (for production)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create or update `backend/.env` file:

```env
# Environment Configuration
NODE_ENV=development
PORT=3000

# Frontend URL
FRONTEND_URL=http://localhost:4200

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# SAP Web Service Configuration
SAP_BASE_URL=http://your-sap-server:8000
SAP_CLIENT=100
SAP_USER=your-sap-user
SAP_PASSWORD=your-sap-password
```

### 3. Start the Applications

**Backend Server:**
```bash
cd backend
npm start        # Production
npm run dev      # Development with nodemon
```

**Frontend Application:**
```bash
cd frontend
npm start        # Runs on http://localhost:4200
```

## Authentication Flow

1. **Customer Login**: User enters Customer-ID and Password
2. **SAP Validation**: 
   - Step 1: Check Customer-ID exists in SAP standard table
   - Step 2: Validate Customer-ID and Password in SAP custom Z-table
3. **JWT Token**: On successful validation, JWT token is issued
4. **Dashboard Access**: Customer can access dashboard with valid token

## Development Mode

For development and testing without SAP connection, the backend includes mock data simulation:

### Test Credentials
- Customer ID: `CUST001`, Password: `password123`
- Customer ID: `CUST002`, Password: `test456`
- Customer ID: `TEST123`, Password: `demo789`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Customer login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

### Customer Data (Protected)
- `GET /api/customer/dashboard` - Dashboard data
- `GET /api/customer/profile` - Customer profile
- `GET /api/customer/orders` - Customer orders

## SAP Integration

The application integrates with SAP ERP through RFC Web Services:

### Required SAP Endpoints
- `/sap/bc/rest/customer/check` - Customer existence validation
- `/sap/bc/rest/customer/authenticate` - Credential validation
- `/sap/bc/rest/customer/dashboard` - Dashboard data
- `/sap/bc/rest/customer/profile` - Customer profile
- `/sap/bc/rest/customer/orders` - Order history

### SAP Data Flow
1. Customer-ID validation in standard table (e.g., KNA1)
2. Password validation in custom Z-table
3. Data retrieval from various SAP modules
4. Response formatting for frontend consumption

## Security Features

- **JWT Authentication**: Secure token-based sessions
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Controlled cross-origin requests
- **Error Handling**: Secure error responses without sensitive data exposure

## Customization

### Adding New Features
1. Create new components in `frontend/src/app/components/`
2. Add corresponding API endpoints in `backend/src/routes/`
3. Update SAP service calls in `backend/src/services/sapService.js`
4. Add route protection with guards if needed

### Styling
- Global styles: `frontend/src/styles.scss`
- Component styles: Individual `.scss` files per component
- CSS variables for consistent theming

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is correctly set in backend `.env`
2. **SAP Connection**: Check SAP server accessibility and credentials
3. **JWT Errors**: Verify `JWT_SECRET` is set and consistent
4. **Port Conflicts**: Ensure ports 3000 (backend) and 4200 (frontend) are available

### Development Tips

- Use browser developer tools to inspect network requests
- Check backend console logs for detailed error information
- Use Postman or similar tools to test API endpoints directly
- Enable development mode for mock data testing

## Production Deployment

1. Update environment variables for production
2. Build frontend: `ng build --configuration production`
3. Set `NODE_ENV=production` in backend
4. Configure reverse proxy (nginx) if needed
5. Set up SSL certificates for HTTPS
6. Configure SAP production endpoints

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review application logs
3. Verify SAP system connectivity
4. Contact system administrator for SAP-related issues
