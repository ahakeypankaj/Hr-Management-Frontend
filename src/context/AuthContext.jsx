import React, { createContext, useContext, useState, useEffect } from 'react'
import { logout as apiLogout } from '../services/auth/auth'
import api from '../services/api'

const AuthContext = createContext()

// Helper function to normalize role
const normalizeRole = (role) => {
  if (!role) {
    console.warn('⚠️ No role provided, defaulting to employee')
    return 'employee'
  }
  
  const roleLower = role.toLowerCase().trim()
  console.log('🔄 Normalizing role:', role, '->', roleLower)
  
  // Handle all possible role variations
  if (roleLower === 'employee' || roleLower === 'emp') {
    return 'employee'
  }
  if (roleLower === 'hr' || roleLower === 'hr_manager' || roleLower === 'hr manager' || roleLower === 'hrmanager') {
    return 'hr_manager'
  }
  if (roleLower === 'admin' || roleLower === 'administrator') {
    return 'admin'
  }
  
  console.warn('⚠️ Unknown role:', role, '- defaulting to employee')
  return 'employee'
}

// Helper function to transform user data
const transformUserData = (userData) => {
  console.log('🔄 Transforming user data:', userData)
  
  // Get role from multiple possible fields
  const role = userData.role || userData.userRole || userData.roleType || 'employee'
  const normalizedRole = normalizeRole(role)
  
  const transformed = {
    isLoggedIn: true,
    role: normalizedRole,
    name: userData.name || '',
    id: userData._id || userData.id || '',
    employeeId: userData.employeeId || '',
    department: userData.department || '',
    designation: userData.designation || '',
    companyEmail: userData.companyEmail || '',
    personalEmail: userData.personalEmail || '',
    phoneNumber: userData.phoneNumber || '',
    joiningDate: userData.joiningDate || '',
    reportingManager: userData.reportingManager || '',
    employmentType: userData.employmentType || '',
    profilePicture: userData.profilePicture || null,
    isActive: userData.isActive !== undefined ? userData.isActive : true
  }
  
  console.log('✅ Transformed user:', transformed)
  return transformed
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to restore user from localStorage on initial load
    const savedUser = localStorage.getItem('hr-nexus-user')
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Only restore if we also have a token
        if (localStorage.getItem('authToken') && parsedUser.isLoggedIn) {
          return parsedUser
        }
      } catch (e) {
        console.error('Error parsing saved user data:', e)
      }
    }
    // Default state
    return { 
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
    }
  })
  const [isInitializing, setIsInitializing] = useState(true)

  // Restore authentication state on mount
  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem('authToken')
      
      if (token) {
        try {
          // Try to fetch current user from API to verify token is still valid
          const response = await api.get('/users/me')
          console.log('📡 /users/me API response:', response.data)
          
          // Handle different response structures: response.data.user or response.data
          const userDataFromAPI = response.data?.user || response.data
          
          if (userDataFromAPI) {
            console.log('👤 User data from API:', userDataFromAPI)
            const userData = transformUserData(userDataFromAPI)
            console.log('✅ Transformed user data:', userData)
            setUser(userData)
            // Save to localStorage
            localStorage.setItem('hr-nexus-user', JSON.stringify(userData))
            console.log('💾 Auth restored successfully and saved to localStorage')
          } else {
            console.error('❌ No user data found in API response')
            throw new Error('No user data in response')
          }
        } catch (error) {
          console.error('❌ Error restoring auth state:', error)
          console.error('Error details:', error.response?.data || error.message)
          // Token might be invalid, clear it
          localStorage.removeItem('authToken')
          localStorage.removeItem('hr-nexus-user')
          localStorage.removeItem('userRole')
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
      } else {
        console.log('ℹ️ No authToken found in localStorage')
      }
      setIsInitializing(false)
    }

    restoreAuth()
  }, [])

  function login(userData) {
    console.log('🔐 Login called with userData:', userData)
    const transformedUser = transformUserData(userData)
    console.log('✅ Transformed user data:', transformedUser)
    setUser(transformedUser)
    // Save to localStorage
    localStorage.setItem('hr-nexus-user', JSON.stringify(transformedUser))
    console.log('💾 User data saved to localStorage')
  }

  async function logout() {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Clear all auth-related data from localStorage
      localStorage.removeItem('authToken')
      localStorage.removeItem('hr-nexus-user')
      localStorage.removeItem('userRole')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
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
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isInitializing }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
