import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName:'', lastName:'', mobile:'', email:'', password:'', confirm:'' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const strength = (pw) => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (!/^\d{10}$/.test(form.mobile)) { setError('Enter a valid 10-digit mobile number'); return }
    setLoading(true)
    try {
      const user = await register({
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        mobile:    form.mobile.trim(),
        password:  form.password,
      })
      toast.success(`Account created! Welcome, ${user.firstName}!`)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const s = strength(form.password)
  const sColor = ['bg-ink/10','bg-danger','bg-amber','bg-amber','bg-verde']
  const sLabel = ['','Weak','Fair','Good','Strong']

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-5"
      style={{backgroundImage:'radial-gradient(900px 500px at 80% -10%,rgba(60,122,106,0.12),transparent 60%)'}}>
      <div className="w-full max-w-md">
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
          <h1 className="font-display text-xl font-semibold text-ink mb-1">Create account</h1>
          <p className="text-sm text-ink-soft mb-6">Start tracking your expenses today</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handle} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-ink-soft">First Name *</label>
                <input className="input" placeholder="Arjun" value={form.firstName}
                  onChange={e=>setForm(p=>({...p,firstName:e.target.value}))} required/>
              </div>
              <div>
                <label className="label text-ink-soft">Last Name</label>
                <input className="input" placeholder="Sharma" value={form.lastName}
                  onChange={e=>setForm(p=>({...p,lastName:e.target.value}))}/>
              </div>
            </div>
            <div>
              <label className="label text-ink-soft">Mobile Number *</label>
              <div className="flex">
                <span className="px-3 py-2.5 bg-paper-dim border border-ink/20 border-r-0 rounded-l-md text-sm text-ink-soft shrink-0">+91</span>
                <input className="input rounded-l-none" type="tel" placeholder="9876543210" maxLength="10"
                  value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))} required/>
              </div>
            </div>
            <div>
              <label className="label text-ink-soft">Email Address *</label>
              <input className="input" type="email" placeholder="arjun@gmail.com" value={form.email}
                onChange={e=>setForm(p=>({...p,email:e.target.value}))} required/>
            </div>
            <div>
              <label className="label text-ink-soft">Password *</label>
              <div className="relative">
                <input className="input pr-10" type={show?'text':'password'} placeholder="Min 8 characters"
                  value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required/>
                <button type="button" onClick={()=>setShow(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">
                  {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i<=s ? sColor[s] : 'bg-ink/10'}`}/>
                    ))}
                  </div>
                  <p className="text-[11px] text-ink-soft mt-1">{sLabel[s]}</p>
                </div>
              )}
            </div>
            <div>
              <label className="label text-ink-soft">Confirm Password *</label>
              <input className="input" type="password" placeholder="Repeat password" value={form.confirm}
                onChange={e=>setForm(p=>({...p,confirm:e.target.value}))} required/>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-verde text-paper rounded-md text-sm font-semibold hover:bg-verde-deep transition-colors disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-soft mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-verde-deep font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
