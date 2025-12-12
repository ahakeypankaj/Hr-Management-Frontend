import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ isLoggedIn: false, role: null, name: '', id: '' })

  function login(role, name, id) {
    setUser({
      isLoggedIn: true,
      role,
      name,
      id
    })
  }

  function logout() {
    setUser({ isLoggedIn: false, role: null, name: '', id: '' })
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
