import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]   = useState({ identifier:'', password:'' })
  const [show, setShow]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.identifier.trim(), form.password)
      toast.success(`Welcome back, ${user.firstName}!`)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-5"
      style={{backgroundImage:'radial-gradient(900px 500px at 80% -10%,rgba(60,122,106,0.12),transparent 60%)'}}>
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full border-2 border-verde flex items-center justify-center text-verde rotate-[-6deg]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <path d="M4 4h16v4H4zM4 10h10v4H4zM4 16h16v4H4z"/>
            </svg>
          </div>
          <div>
            <div className="font-display font-semibold text-paper text-xl">ExpenseAI</div>
            <div className="text-[10px] uppercase tracking-widest text-pencil-navy">Ledger Console</div>
          </div>
        </div>

        <div className="bg-paper rounded-md shadow-lift p-8">
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Sign in</h1>
          <p className="text-sm text-ink-soft mb-6">Welcome back to your ledger</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="label text-ink-soft">Mobile / Email</label>
              <input className="input" type="text" placeholder="9876543210 or name@email.com"
                value={form.identifier} onChange={e=>setForm(p=>({...p,identifier:e.target.value}))} required/>
            </div>
            <div>
              <label className="label text-ink-soft">Password</label>
              <div className="relative">
                <input className="input pr-10" type={show?'text':'password'} placeholder="Enter your password"
                  value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/>
                <button type="button" onClick={()=>setShow(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-verde text-paper rounded-md text-sm font-semibold hover:bg-verde-deep transition-colors disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in to ExpenseAI'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-soft mt-5">
            No account?{' '}
            <Link to="/register" className="text-verde-deep font-medium hover:underline">Create one</Link>
          </p>
          <p className="text-center text-xs text-ink-soft/60 mt-2">
            Demo: demo@expenseai.in / Demo@1234
          </p>
        </div>
      </div>
    </div>
  )
}
