import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout    from './components/Layout'
import Login     from './pages/Login'
import Register  from './pages/Register'
import Overview  from './pages/Overview'
import Accounts  from './pages/Accounts'
import Transactions from './pages/Transactions'
import Settings  from './pages/Settings'
import Sources   from './pages/Sources'
import Insights  from './pages/Insights'
import Chat      from './pages/Chat'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <div className="text-pencil-navy text-sm font-mono animate-pulse">Loading…</div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" toastOptions={{
        style: { background:'#3C7A6A', color:'#F6F1E4', fontFamily:'IBM Plex Sans', fontSize:'13.5px' },
        error: { style: { background:'#A8432F' } }
      }} />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index             element={<Overview />} />
          <Route path="sources"    element={<Sources />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="chat"       element={<Chat />} />
          <Route path="insights"   element={<Insights />} />
          <Route path="accounts"   element={<Accounts />} />
          <Route path="payments"   element={<Transactions />} />
          <Route path="settings"   element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
