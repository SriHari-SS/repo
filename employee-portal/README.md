# Employee Portal - SAP Integrated HR & Finance System

A modern, enterprise-grade Employee Portal built with Angular 18 frontend and Node.js backend, integrated with SAP ERP system for comprehensive HR and Finance management.

![Employee Portal](https://img.shields.io/badge/Version-1.0.0-blue)
![Angular](https://img.shields.io/badge/Angular-18-red)
![Node.js](https://img.shields.io/badge/Node.js-Latest-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication system
- Frontend-only authentication for development
- Secure password handling
- Rate limiting for authentication endpoints
- CORS protection

### 👤 Employee Management
- Comprehensive employee profiles
- Hierarchy visualization
- Team management
- Role-based access control

### 📊 Dashboard & Analytics
- Modern, responsive dashboard
- Real-time statistics
- Performance metrics
- Activity tracking
- Quick action buttons

### 🏖️ Leave Management
- Leave balance tracking
- Leave application system
- Approval workflows
- Leave history

### 💰 Payslip & Finance
- Salary breakdowns
- Payslip generation
- Financial reports
- Tax information

### 📅 Attendance System
- Time tracking
- Attendance reports
- Clock in/out functionality

## 🛠️ Technology Stack

### Frontend
- **Angular 18** - Latest Angular framework with standalone components
- **TypeScript** - Type-safe development
- **SCSS** - Advanced styling with variables and mixins
- **RxJS** - Reactive programming
- **Angular Reactive Forms** - Form handling and validation

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web application framework
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing

### Integration
- **SAP PO** - SAP Process Orchestration interface
- **RESTful APIs** - Clean API design patterns
- **Axios** - HTTP client for API requests

## 📁 Project Structure

```
employee-portal/
├── frontend/                 # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # Angular components
│   │   │   ├── services/     # Angular services
│   │   │   ├── models/       # TypeScript interfaces
│   │   │   └── guards/       # Route guards
│   │   ├── assets/           # Static assets
│   │   └── environments/     # Environment configurations
│   ├── angular.json          # Angular configuration
│   ├── package.json          # Frontend dependencies
│   └── tsconfig.json         # TypeScript configuration
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Custom middleware
│   │   ├── models/           # Data models
│   │   ├── routes/           # API routes
│   │   └── services/         # Business logic
│   ├── package.json          # Backend dependencies
│   └── server.js             # Entry point
├── .gitignore               # Git ignore file
└── README.md                # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/employee-portal.git
   cd employee-portal
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd ../backend
   npm install
   ```

### Development Setup

1. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:3000
   ```

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   ng serve
   # Application runs on http://localhost:4200
   ```

### Default Login Credentials

For development and testing purposes, use these credentials:

| Employee ID | Password    | Role              |
|-------------|-------------|-------------------|
| EMP001      | password123 | Software Engineer |
| EMP002      | password123 | HR Manager        |
| EMP003      | password123 | Finance Manager   |
| EMP004      | password123 | Team Lead         |

## 🎨 Design Features

### Modern UI/UX
- **Glassmorphism Design** - Modern transparent glass-like effects
- **Gradient Backgrounds** - Beautiful color gradients
- **Responsive Layout** - Works perfectly on all devices
- **CSS Grid & Flexbox** - Perfect layout alignment
- **Smooth Animations** - Engaging user interactions

### Professional Header
- **3-Column Grid Layout** - Brand, Navigation, User Profile
- **Search Functionality** - Global search across the portal
- **Action Buttons** - Quick access to notifications and settings
- **User Menu** - Comprehensive dropdown with profile options

### Dashboard Cards
- **Fixed Height Design** - Perfect alignment across all cards
- **Hover Effects** - Interactive card animations
- **Progress Bars** - Visual representation of data
- **Color-coded Status** - Intuitive status indicators

## 🔧 Configuration

### Environment Variables
Create `.env` files in both frontend and backend directories:

**Frontend** (`frontend/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  sapEndpoint: 'your-sap-endpoint'
};
```

**Backend** (`.env`):
```env
PORT=3000
JWT_SECRET=your-jwt-secret
SAP_ENDPOINT=your-sap-endpoint
SAP_USERNAME=your-sap-username
SAP_PASSWORD=your-sap-password
```

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1200px+) - Full featured experience
- **Tablet** (768px - 1199px) - Adapted layout
- **Mobile** (< 768px) - Mobile-first design

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
npm test
```

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
ng build --prod

# Backend
cd backend
npm run build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Frontend Developer** - Angular 18, TypeScript, SCSS
- **Backend Developer** - Node.js, Express, JWT
- **SAP Integration** - SAP PO, REST APIs
- **UI/UX Designer** - Modern Enterprise Design

## 🐛 Known Issues

- SAP integration requires proper endpoint configuration
- Some features require backend implementation
- Mobile responsiveness is optimized for modern browsers

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced reporting features
- [ ] Mobile application
- [ ] AI-powered analytics
- [ ] Multi-language support
- [ ] Dark mode theme

## 📞 Support

For support and questions, please contact:
- Email: support@company.com
- Internal Slack: #employee-portal
- Documentation: [Internal Wiki](link-to-internal-docs)

---

**Built with ❤️ for modern enterprise needs** - SAP Integrated HR & Finance System

A comprehensive employee portal built with Angular frontend and Node.js backend, integrated with SAP ERP system for Human Resource (HR) and Finance (FI) modules.

## 🏗️ Architecture Overview

```
Employee Portal
├── Frontend (Angular 18)
│   ├── Employee Login
│   ├── Dashboard
│   ├── Payslip Management
│   ├── Leave Management
│   └── Profile Management
├── Backend (Node.js/Express)
│   ├── Authentication Service
│   ├── SAP Integration Service
│   ├── Employee Data Service
│   └── Payroll Service
└── SAP ERP Integration
    ├── SAP PO Interface
    ├── HR Module (PA tables)
    ├── Finance Module (FI tables)
    └── Custom Z-tables
```

## 🎯 Objectives

The Employee portal is designed to:
- Understand functionalities of Human Resource (HR) and Finance (FI) modules
- Provide organizational and employee information
- Generate printable payslips
- Display leave balance and handle leave requests
- Offer quick and easy access to HR-related transactions and services

## 🔐 Authentication Flow

1. **Employee Login**: User enters Employee-ID and Password
2. **Standard Table Check**: Validates Employee-ID presence in SAP standard table
3. **Credential Verification**: Authenticates Employee-ID and Password in custom Z-table
4. **SAP PO Interface**: Employee-ID reaches SAP ERP system via SAP PO interface
5. **Validation Response**: SAP ERP system sends validation result back to portal
6. **Dashboard Access**: Upon successful validation, employee accesses their dashboard

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v18 or higher)
- SAP PO system access (for production)

### Installation

1. **Clone the repository** (or navigate to the project directory)
   ```bash
   cd employee-portal
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   
   Copy the backend `.env` file and update with your SAP credentials:
   ```bash
   cd backend
   cp .env .env.local
   # Edit .env.local with your actual SAP PO credentials
   ```

4. **Start the application**
   ```bash
   npm start
   ```

   This will start both frontend (http://localhost:4200) and backend (http://localhost:3000) concurrently.

## 🔧 Development Setup

### Frontend Development (Angular)

```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
npm run test       # Run unit tests
npm run lint       # Run linting
```

The frontend will be available at `http://localhost:4200`

### Backend Development (Node.js)

```bash
cd backend
npm run dev        # Start development server with nodemon
npm start          # Start production server
npm test           # Run tests
```

The backend API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Employee login
- `POST /api/auth/logout` - Employee logout
- `GET /api/auth/verify` - Verify JWT token

### Employee Data
- `GET /api/employee/profile` - Get employee profile
- `GET /api/employee/payslip/:month/:year` - Get payslip
- `GET /api/employee/leave-balance` - Get leave balance
- `POST /api/employee/leave-request` - Submit leave request

## 🔑 Demo Credentials (Development)

For development and testing purposes, you can use these demo credentials:

| Employee ID | Password    | Role     | Department |
|------------|-------------|----------|------------|
| EMP001     | password123 | Employee | IT         |
| EMP002     | welcome@123 | Manager  | HR         |
| EMP003     | employee123 | Employee | Finance    |

## 🏢 SAP Integration

### SAP PO Interface Configuration

The application integrates with SAP ERP through SAP Process Orchestration (PO) interface:

- **Base URL**: Configure in `backend/.env` file
- **Authentication**: Username/Password based
- **Client**: SAP client number
- **Language**: Default language for SAP communication

### SAP Tables Accessed

- **PA0001**: Employee organizational data
- **Custom Z-table**: Employee authentication credentials
- **Payroll tables**: Employee salary and deduction information
- **Leave tables**: Leave balance and request data

### Environment Variables

```env
# SAP Configuration
SAP_PO_BASE_URL=https://your-sap-po-server.com
SAP_PO_USERNAME=your-sap-username
SAP_PO_PASSWORD=your-sap-password
SAP_PO_CLIENT=100
SAP_PO_LANGUAGE=EN

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=employee_portal
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

## 🎨 Features

### ✅ Implemented Features

- **Employee Authentication** with SAP integration
- **Responsive Login Page** with validation
- **Employee Dashboard** with module access
- **Profile Management**
- **Leave Balance Display**
- **Payslip Generation**
- **Leave Request Submission**

### 🚧 Upcoming Features

- Tax Document Management
- Expense Claim Processing
- Attendance Reporting
- Performance Review System
- Goals & Objectives Tracking

## 🛠️ Technology Stack

### Frontend
- **Angular 18** - Modern web framework
- **TypeScript** - Type-safe development
- **SCSS** - Enhanced CSS with variables and mixins
- **RxJS** - Reactive programming
- **Angular Router** - Client-side routing
- **Angular Forms** - Reactive forms with validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **JWT** - JSON Web Token authentication
- **Axios** - HTTP client for SAP integration
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Security Features
- JWT-based authentication
- Password strength validation
- Rate limiting for login attempts
- Input sanitization
- CORS protection
- Security headers with Helmet

## 📁 Project Structure

```
employee-portal/
├── frontend/                 # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/   # UI components
│   │   │   │   ├── login/
│   │   │   │   └── dashboard/
│   │   │   ├── services/     # Angular services
│   │   │   │   └── auth.service.ts
│   │   │   ├── app.config.ts
│   │   │   ├── app.routes.ts
│   │   │   └── app.ts
│   │   ├── styles.scss       # Global styles
│   │   └── index.html
│   ├── package.json
│   └── angular.json
├── backend/                  # Node.js application
│   ├── routes/              # API routes
│   │   ├── auth.js          # Authentication routes
│   │   └── employee.js      # Employee data routes
│   ├── services/            # Business logic
│   │   └── sapService.js    # SAP integration service
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── validation.js    # Input validation
│   ├── server.js            # Express server setup
│   ├── .env                 # Environment variables
│   └── package.json
├── package.json             # Root package.json
└── README.md               # This file
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test           # Run unit tests
npm run e2e           # Run end-to-end tests
```

### Backend Testing
```bash
cd backend
npm test              # Run API tests
```

## 🚀 Deployment

### Production Build

1. **Build frontend**
   ```bash
   npm run build:frontend
   ```

2. **Prepare backend**
   ```bash
   npm run build:backend
   ```

3. **Environment Setup**
   - Update `.env` with production SAP credentials
   - Set `NODE_ENV=production`
   - Configure production database

### Docker Deployment (Optional)

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --only=production
COPY backend/ .
COPY --from=build /app/dist /app/public
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🙏 Acknowledgments

- SAP ERP integration capabilities
- Angular team for the excellent framework
- Node.js community for robust backend tools
- All contributors and testers

---

**Employee Portal** - Bridging the gap between employees and enterprise systems through seamless SAP integration.
