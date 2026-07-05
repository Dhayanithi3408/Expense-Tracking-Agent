import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('eai_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem('eai_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password })
    localStorage.setItem('eai_token', data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form)
    localStorage.setItem('eai_token', data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('eai_token')
    setUser(null)
  }

  const updateUser = (updates) => setUser(prev => ({ ...prev, ...updates }))

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}
