# Vendor Portal - Frontend

An Angular-based vendor portal frontend application that provides secure authentication and dashboard functionality for vendors integrating with SAP ERP systems.

## 🏗️ Project Overview

This project implements the frontend portion of a comprehensive vendor portal system that:
- Authenticates vendors using Vendor ID and password against SAP ERP systems
- Provides a professional dashboard with business insights
- Integrates with Node.js backend for SAP communication via SAP PO interface
- Offers responsive design for desktop and mobile access

## 🚀 Features

### ✅ Implemented Features
- **Vendor Authentication**
  - Secure login with Vendor ID and password
  - Real-time form validation with user-friendly error messages
  - Integration with SAP ERP authentication via backend API
  - JWT token-based session management

- **Vendor Dashboard**
  - Professional dashboard with business statistics
  - Recent activity tracking
  - Quick action buttons for common tasks
  - Responsive design for all device types

- **Modern UI/UX**
  - Clean, professional interface following material design principles
  - Dark mode support (system preference based)
  - Accessible design with ARIA labels and keyboard navigation
  - Loading states and error handling

## 🛠️ Technology Stack

- **Framework**: Angular 20.1.4
- **Language**: TypeScript
- **Styling**: SCSS with modern CSS features
- **Architecture**: Standalone components (no NgModules)
- **HTTP Client**: Angular HttpClient with RxJS
- **Routing**: Angular Router with route guards
- **Forms**: Reactive Forms with validation

## 📋 Prerequisites

- Node.js 18+ and npm
- Angular CLI 20+
- Backend API server (Node.js with SAP integration)

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start development server
ng serve
# or
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload when you make changes.

### Environment Configuration

Update the environment files for your specific setup:

**src/environments/environment.ts** (Development)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'  // Your backend API URL
};
```

## 🔐 Authentication Flow

1. **Vendor Login**: Vendor enters Vendor ID and password
2. **Frontend Validation**: Client-side form validation
3. **API Request**: Credentials sent to backend API
4. **SAP Integration**: Backend validates with SAP ERP system
   - Checks vendor presence in standard SAP tables
   - Validates credentials in custom Z-table
   - Communicates via SAP PO interface
5. **Response Handling**: Success returns JWT token and vendor data
6. **Session Management**: Token stored securely, user redirected to dashboard

## 🏗️ Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/          # Login component
│   │   └── auth.ts         # Authentication service
│   ├── dashboard/          # Vendor dashboard component
│   ├── models/             # TypeScript interfaces
│   └── app.routes.ts       # Application routing
├── environments/           # Environment configurations
└── styles.scss            # Global styles
```

## 🧪 Building and Testing

```bash
# Build for production
ng build --configuration production

# Run unit tests
ng test

# Start development server
ng serve
```

## 📝 API Integration

The frontend integrates with the following backend endpoints:

- `POST /api/auth/vendor/login` - Vendor authentication
- `GET /api/auth/validate` - Session validation
- Additional endpoints for dashboard data (to be implemented)

---

**Note**: This frontend application requires a corresponding Node.js backend with SAP integration to function properly. Ensure the backend API is running and properly configured before testing the authentication flow.
