import React, { createContext, useContext, useState } from 'react'
import { logout as apiLogout } from '../services/auth/auth'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ 
    isLoggedIn: false, 
    role: null, 
    name: '', 
    id: '',
    employeeId: '',
    department: '',
    designation: '',
    companyEmail: '',
    personalEmail: '',
    phoneNumber: '',
    joiningDate: '',
    reportingManager: '',
    employmentType: '',
    profilePicture: null,
    isActive: true
  })

  function login(userData) {
    setUser({
      isLoggedIn: true,
      role: userData.role?.toLowerCase() === 'employee' ? 'employee' : 
            userData.role?.toLowerCase() === 'hr' ? 'hr_manager' : 
            userData.role?.toLowerCase() === 'admin' ? 'admin' : 'employee',
      name: userData.name,
      id: userData._id,
      employeeId: userData.employeeId,
      department: userData.department,
      designation: userData.designation,
      companyEmail: userData.companyEmail,
      personalEmail: userData.personalEmail,
      phoneNumber: userData.phoneNumber,
      joiningDate: userData.joiningDate,
      reportingManager: userData.reportingManager,
      employmentType: userData.employmentType,
      profilePicture: userData.profilePicture,
      isActive: userData.isActive
    })
  }

  async function logout() {
    await apiLogout()
    setUser({ 
      isLoggedIn: false, 
      role: null, 
      name: '', 
      id: '',
      employeeId: '',
      department: '',
      designation: '',
      companyEmail: '',
      personalEmail: '',
      phoneNumber: '',
      joiningDate: '',
      reportingManager: '',
      employmentType: '',
      profilePicture: null,
      isActive: true
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
