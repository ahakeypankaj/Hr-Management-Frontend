import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import MainLayout from '../layouts/MainLayout'

// Auth
import Login from '../pages/auth/Login'

// Employee Pages
import Dashboard from '../pages/dashboard/Dashboard'
import Profile from '../pages/profile/Profile'
import Onboarding from '../pages/onboarding/OnboardingForm'
import Attendance from '../pages/attendance/Attendance'
import LeaveManagement from '../pages/leave/LeaveManagement'
import ExpenseManagement from '../pages/expense/ExpenseManagement'
import EmployeeDirectory from '../pages/directory/EmployeeDirectory'
import EmployeeProfile from '../pages/directory/EmployeeProfile'
import Grievance from '../pages/grievance/Grievance'
import Performance from '../pages/performance/Performance'
import Events from '../pages/events/Events'

// HR/Manager Pages
import TeamUserManagement from '../pages/hr/TeamUserManagement'
import AttendanceManagement from '../pages/hr/AttendanceManagement'
import Approvals from '../pages/hr/Approvals'
import AddEmployee from '../pages/hr/AddEmployee'
import PerformanceHub from '../pages/hr/PerformanceHub'
import Reports from '../pages/hr/Reports'
import Settings from '../pages/hr/Settings'
import HRGrievances from '../pages/hr/HRGrievances'

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth()
  
  if (!user.isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <MainLayout>{children}</MainLayout>
}

export default function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* ===================== PUBLIC ROUTE ===================== */}
      <Route 
        path="/login" 
        element={user.isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />} 
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* ===================== ALL USERS ===================== */}
      {/* Dashboard - Available to all logged in users */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />

      {/* Events - Available to all logged in users */}
      <Route path="/events" element={
        <ProtectedRoute><Events /></ProtectedRoute>
      } />

      {/* ===================== EMPLOYEE & HR/MANAGER ONLY ===================== */}
      {/* These pages are NOT for Admin */}
      
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['employee', 'hr_manager']}><Profile /></ProtectedRoute>
      } />
      
      <Route path="/attendance" element={
        <ProtectedRoute allowedRoles={['employee', 'hr_manager']}><Attendance /></ProtectedRoute>
      } />
      
      <Route path="/leave" element={
        <ProtectedRoute allowedRoles={['employee', 'hr_manager']}><LeaveManagement /></ProtectedRoute>
      } />
      
      <Route path="/expense" element={
        <ProtectedRoute allowedRoles={['employee', 'hr_manager']}><ExpenseManagement /></ProtectedRoute>
      } />
      
      <Route path="/grievance" element={
        <ProtectedRoute allowedRoles={['employee', 'hr_manager']}><Grievance /></ProtectedRoute>
      } />
      
      <Route path="/performance" element={
        <ProtectedRoute allowedRoles={['employee', 'hr_manager']}><Performance /></ProtectedRoute>
      } />

      <Route path="/onboarding" element={
        <ProtectedRoute allowedRoles={['employee', 'hr_manager']}><Onboarding /></ProtectedRoute>
      } />

      {/* ===================== HR/MANAGER & ADMIN ONLY ===================== */}
      {/* Directory - HR/Manager and Admin only */}
      <Route path="/directory" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><EmployeeDirectory /></ProtectedRoute>
      } />
      
      <Route path="/directory/:id" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><EmployeeProfile /></ProtectedRoute>
      } />

      {/* Team & User Management (Combined) */}
      <Route path="/hr/team" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><TeamUserManagement /></ProtectedRoute>
      } />
      
      {/* User Management (redirects to team) */}
      <Route path="/hr/users" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><TeamUserManagement /></ProtectedRoute>
      } />
      
      {/* Attendance Management */}
      <Route path="/hr/attendance" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><AttendanceManagement /></ProtectedRoute>
      } />
      
      {/* Grievance Management */}
      <Route path="/hr/grievances" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><HRGrievances /></ProtectedRoute>
      } />
      
      {/* Approvals */}
      <Route path="/hr/approvals" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><Approvals /></ProtectedRoute>
      } />
      
      {/* Add Employee */}
      <Route path="/hr/users/add" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><AddEmployee /></ProtectedRoute>
      } />
      
      {/* Performance Hub */}
      <Route path="/hr/performance" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><PerformanceHub /></ProtectedRoute>
      } />
      
      {/* Reports */}
      <Route path="/hr/reports" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><Reports /></ProtectedRoute>
      } />
      
      {/* Settings & Audit */}
      <Route path="/hr/settings" element={
        <ProtectedRoute allowedRoles={['hr_manager', 'admin']}><Settings /></ProtectedRoute>
      } />

      {/* ===================== CATCH ALL ===================== */}
      <Route path="*" element={
        user.isLoggedIn 
          ? <ProtectedRoute><div className='p-6 text-center'>Page not found</div></ProtectedRoute>
          : <Navigate to="/login" replace />
      } />
    </Routes>
  )
}
