<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Employee Portal - SAP Integrated HR & Finance System

## Project Overview
This is an Employee Portal with Angular frontend and Node.js backend integrated with SAP ERP system for HR and Finance modules.

## Architecture
- **Frontend**: Angular 18 with TypeScript, SCSS, and reactive forms
- **Backend**: Node.js/Express with JWT authentication and SAP integration
- **Integration**: SAP PO interface for authentication and data access

## Key Technologies
- Angular 18 (standalone components)
- Node.js/Express
- JWT authentication
- SAP PO integration
- TypeScript
- SCSS
- RxJS

## Code Style Guidelines
- Use TypeScript for all Angular and Node.js code
- Follow Angular style guide for component structure
- Use reactive forms for Angular forms
- Implement proper error handling for SAP integration
- Use environment variables for configuration
- Follow RESTful API design patterns

## Security Requirements
- JWT-based authentication
- Input validation and sanitization
- Rate limiting for authentication endpoints
- Secure password handling
- CORS protection

## SAP Integration Patterns
- Use axios for HTTP requests to SAP PO
- Implement proper error handling for SAP communication
- Cache employee data when appropriate
- Handle SAP authentication and session management
- Follow SAP naming conventions for table and field references

## Component Structure
- Use standalone Angular components
- Implement reactive forms with validation
- Use services for business logic and API communication
- Follow Angular best practices for component communication

## Styling Guidelines
- Use SCSS for styling
- Implement responsive design
- Use CSS Grid and Flexbox for layouts
- Follow consistent color scheme and typography
- Implement proper accessibility features
