# HR Nexus - Human Resources Management System

A comprehensive, modern HR management frontend application built with React, featuring role-based access control for Employees, HR/Managers, and Administrators.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.3-61dafb.svg)
![License](https://img.shields.io/badge/license-Private-red.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Role-Based Access](#role-based-access)
- [API Integration](#api-integration)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Contributing](#contributing)

## 🎯 Overview

HR Nexus is a full-featured Human Resources Management System designed to streamline HR operations, employee self-service, and organizational management. The application provides distinct interfaces for three user roles with tailored functionalities.

### Key Highlights

- 🎨 **Modern UI/UX**: Beautiful, professional design with dark/light mode support
- 🔐 **Role-Based Access**: Separate experiences for Employees, HR/Managers, and Admins
- 📱 **Responsive Design**: Fully responsive across all device sizes
- 🔄 **Real-time Updates**: Live data synchronization with backend APIs
- 🎭 **Theme Support**: Dark and light mode with smooth transitions

## ✨ Features

### Core Features

#### 📊 Dashboard
- Role-specific dashboards with key metrics
- Visual charts (Pie, Donut, Bar charts)
- Quick actions and recent activities
- Quote of the Day (updates weekly)

#### 👥 Employee Management
- Employee directory with search and filters
- Detailed employee profiles
- Onboarding workflow management
- Employee lifecycle tracking

#### ⏰ Attendance Management
- Check-in/Check-out functionality
- Attendance history and reports
- Monthly attendance calendar
- Export attendance reports
- HR dashboard for attendance overview

#### 🏖️ Leave Management
- Leave application with multiple leave types
- Leave balance tracking
- Leave history and status
- Manager approvals workflow
- Rejection reasons display

#### 💰 Expense Management
- Expense submission
- Expense categories (Travel, Food, Accommodation, etc.)
- Receipt upload
- Expense approval workflow
- Expense summary and reports

#### 📝 Grievance System
- Submit grievances with categories
- Priority levels (Critical, High, Medium, Low)
- Anonymous submission option
- Comments and updates
- HR grievance management dashboard

#### 🎯 Performance Management
- Performance reviews
- Goal tracking
- Self-assessments
- Manager evaluations

#### 🎉 Events & Engagement
- Company events calendar
- Employee kudos and recognition
- Event participation tracking

#### 📄 Document Management
- Document upload portal
- Standalone document upload (shareable links)
- Document verification status

### HR/Manager Features

- Employee onboarding approval
- BGV (Background Verification) management
- Attendance oversight
- Leave approvals
- Expense approvals
- Grievance resolution
- Performance reviews
- Reports and analytics
- Team management

### Admin Features

- Full system access
- User administration
- Organization-wide management
- System settings
- Audit logs

## 🛠️ Tech Stack

### Frontend
- **React 19.2.3** - UI library
- **React Router DOM 7.10.1** - Routing
- **Axios 1.13.2** - HTTP client
- **Tailwind CSS 4.1.18** - Utility-first CSS
- **Vite 7.2.7** - Build tool

### Authentication
- **Azure MSAL** (@azure/msal-react, @azure/msal-browser) - Microsoft authentication
- Custom authentication context

### Key Libraries
- **clsx** - Conditional classnames
- **React Hooks** - State management

## 🚀 Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-nexus-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory (if needed):
   ```env
   VITE_API_URL=https://hrm-backend-caza.onrender.com/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5175`

## ⚙️ Configuration

### API Configuration

The API base URL is configured in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'https://hrm-backend-caza.onrender.com/api',
  timeout: 10000,
})
```

To change the API URL, update this file or use environment variables.

### Port Configuration

The development server port is configured in `vite.config.js`:

```javascript
server: {
  port: 5175,
  open: true
}
```

## 📁 Project Structure

```
hr-nexus-frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons
│   ├── components/        # Reusable components
│   │   └── charts/        # Chart components (Pie, Donut, Bar)
│   ├── context/           # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── layouts/           # Layout components
│   │   └── MainLayout.jsx
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── attendance/    # Attendance pages
│   │   ├── leave/         # Leave management
│   │   ├── expense/       # Expense management
│   │   ├── grievance/     # Grievance system
│   │   ├── directory/     # Employee directory
│   │   ├── hr/            # HR-specific pages
│   │   └── ...
│   ├── routes/            # Route configuration
│   │   └── AppRoutes.jsx
│   ├── services/          # API service layer
│   │   ├── api.js         # Axios instance
│   │   ├── auth/          # Authentication services
│   │   ├── attendanceService.js
│   │   ├── leaveService.js
│   │   ├── expenseService.js
│   │   ├── grievanceService.js
│   │   ├── directoryService.js
│   │   └── onboardingServices.js
│   ├── styles/            # Global styles
│   ├── App.jsx            # Root component
│   └── main.jsx           # Entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 👥 Role-Based Access

### Employee Role

**Available Pages:**
- Dashboard
- My Profile
- Attendance (Check-in/Check-out)
- Leave Management
- Expenses
- Grievance
- Performance
- Events & Kudos

**Permissions:**
- View own data
- Submit leave requests
- Submit expenses
- Submit grievances
- Check attendance

### HR/Manager Role

**Available Pages:**
- All Employee pages, plus:
- Dashboard (HR view)
- Approvals
- Onboarding Employees
- Add Onboarding Employee
- Attendance Management
- Grievance Management
- Directory
- Performance Hub
- Reports
- Settings & Audit

**Permissions:**
- All employee permissions
- Approve/reject leaves
- Approve/reject expenses
- Manage onboarding
- View team attendance
- Resolve grievances
- Access employee directory

### Admin Role

**Available Pages:**
- User Administration
- Onboarding Employees
- Approvals
- Attendance Management
- Grievance Management
- Directory
- Performance Hub
- Events & Kudos
- Reports
- Settings

**Permissions:**
- Full system access
- User management
- System configuration
- All HR permissions

## 🔌 API Integration

The application integrates with a RESTful backend API. All API calls are centralized in the `src/services/` directory.

### Available Services

- **Authentication**: `services/auth/auth.js`
- **Attendance**: `services/attendanceService.js`
- **Leave**: `services/leaveService.js`
- **Expense**: `services/expenseService.js`
- **Grievance**: `services/grievanceService.js`
- **Directory**: `services/directoryService.js`
- **Onboarding**: `services/onboardingServices.js`

### API Base URL

Default: `https://hrm-backend-caza.onrender.com/api`

### Request Interceptors

All API requests automatically include:
- Authorization headers (Bearer token)
- Content-Type headers
- Error handling

### Example API Call

```javascript
import { fetchEmployees } from '../../services/directoryService';

const loadEmployees = async () => {
  try {
    const response = await fetchEmployees();
    // Handle response
  } catch (error) {
    // Handle error
  }
};
```

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Maintain consistent file structure
- Add comments for complex logic

### Adding New Features

1. Create component in appropriate `pages/` directory
2. Add route in `src/routes/AppRoutes.jsx`
3. Create service functions in `src/services/`
4. Update navigation menu if needed
5. Test with different user roles

### Theme Development

The app supports dark/light themes via `ThemeContext`. To add theme-aware styles:

```javascript
const { theme } = useTheme();
const isDark = theme === "dark";

const style = {
  backgroundColor: isDark ? '#1e293b' : '#ffffff',
  color: isDark ? '#f8fafc' : '#0f172a'
};
```

## 🏗️ Build & Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

1. **Static Hosting** (Vercel, Netlify, etc.)
   - Connect repository
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Traditional Web Server**
   - Run `npm run build`
   - Serve `dist/` directory
   - Configure server for SPA routing

### Environment Variables

For production, configure:
- `VITE_API_URL` - Backend API URL
- Other environment-specific variables

## 📝 Key Features Documentation

### Authentication

- Email/Password login
- Microsoft/Google OAuth (configured)
- JWT token management
- Session persistence
- Auto-logout on token expiry

### Attendance

- Check-in with location
- Check-out
- Work mode (Office/Remote)
- Attendance history
- Monthly calendar view
- Export reports

### Leave Management

**Leave Types:**
- Casual Leave
- Sick Leave
- Annual Leave
- Vacation
- Maternity Leave
- Paternity Leave
- Bereavement Leave
- Unpaid Leave

**Features:**
- Leave balance display
- Leave application with dates
- Attachment upload
- Approval workflow
- Rejection with reasons

### Expense Management

**Categories:**
- Travel
- Food & Meals
- Accommodation
- Office Supplies
- Fuel
- Internet
- Other

**Features:**
- Expense submission
- Receipt upload
- Category selection
- Amount tracking
- Approval workflow

### Onboarding

**Workflow:**
1. Add onboarding employee
2. Manager approval
3. BGV verification
4. Document upload
5. Final onboarding

**Features:**
- Multi-step form
- Document upload portal
- Shareable upload links
- Status tracking

## 🔒 Security

- Protected routes with role-based access
- JWT token authentication
- Secure API communication
- Input validation
- XSS protection (React default)

## 🐛 Troubleshooting

### Port Already in Use

If port 5175 is in use:
```bash
# Find and kill process
lsof -ti:5175 | xargs kill -9

# Or change port in vite.config.js
```

### API Connection Issues

- Check API base URL in `src/services/api.js`
- Verify backend server is running
- Check network/CORS settings
- Verify authentication token

### Build Errors

- Clear `node_modules` and reinstall
- Check Node.js version (18+)
- Verify all dependencies are installed

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## 📄 License

Private - All rights reserved

## 👨‍💻 Support

For issues and questions:
- Check documentation
- Review code comments
- Contact development team

## 🎨 Design System

### Colors

- **Primary Navy**: `#1e3a5f`
- **Primary Blue**: `#2563eb`
- **Success Green**: `#16a34a`
- **Warning Orange**: `#ea580c`
- **Error Red**: `#dc2626`
- **Purple**: `#7c3aed`

### Typography

- **Font Family**: 'Outfit', sans-serif
- **Headings**: Bold, various sizes
- **Body**: Regular weight

### Spacing

- Consistent padding/margin using Tailwind classes
- Card spacing: `p-6` (24px)
- Section spacing: `space-y-6` (24px)

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Maintained by**: Irish Taylor & Co
