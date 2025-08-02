# Copilot Instructions for Vendor Portal

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an Angular-based vendor portal frontend application that integrates with SAP ERP systems through a Node.js backend. The portal allows vendors to authenticate using their Vendor ID and password, which are validated against SAP's standard tables and custom Z-tables.

## Technology Stack
- **Frontend**: Angular 20+ with standalone components
- **Styling**: SCSS with modern CSS features
- **Authentication**: JWT-based authentication with SAP integration
- **HTTP Client**: Angular HttpClient for API communication
- **Routing**: Angular Router with route guards

## Key Features Implemented
1. **Vendor Authentication**: Login with Vendor ID and password validation through SAP ERP
2. **Dashboard**: Comprehensive vendor dashboard with statistics and activities
3. **Responsive Design**: Mobile-first responsive design
4. **Professional UI**: Modern, clean interface following material design principles

## Code Style Guidelines
- Use standalone components (no NgModules)
- Implement reactive forms for all form handling
- Use TypeScript interfaces for type safety
- Follow Angular style guide conventions
- Use SCSS for styling with BEM methodology
- Implement proper error handling and user feedback

## Authentication Flow
1. Vendor enters Vendor ID and password
2. Frontend validates input and sends request to backend
3. Backend checks vendor presence in SAP standard tables
4. Backend validates credentials in custom Z-table
5. Backend communicates with SAP ERP via SAP PO interface
6. Successful authentication returns JWT token and vendor data
7. Frontend stores token and redirects to dashboard

## API Integration
- Base API URL configured in environment files
- HTTP interceptors for authentication headers
- Proper error handling for different HTTP status codes
- Observable-based async operations

## Security Considerations
- JWT tokens stored in localStorage with validation
- Form validation with proper error messages
- Session validation on protected routes
- Secure HTTP communication with backend

## Development Notes
- Environment configuration for different deployment stages
- Modular component structure for maintainability
- Comprehensive error handling and user feedback
- Accessibility features implemented
