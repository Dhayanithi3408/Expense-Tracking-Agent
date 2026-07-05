import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('eai_token')
    if (!token) { setLoading(false); return }
    api.get('/auth/me')
      .then(r => setUser(r.data))
      .catch(() => { localStorage.removeItem('eai_token'); localStorage.removeItem('eai_user') })
      .finally(() => setLoading(false))
  }, [])

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password })
    localStorage.setItem('eai_token', data.token)
    localStorage.setItem('eai_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (form) => {
    const { data } = await api.post('/auth/register', form)
    localStorage.setItem('eai_token', data.token)
    localStorage.setItem('eai_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('eai_token')
    localStorage.removeItem('eai_user')
    setUser(null)
  }

  const updateUser = (updated) => setUser(u => ({ ...u, ...updated }))

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthCtx.Provider>
  )
}

export const useAuth = () => useContext(AuthCtx)
