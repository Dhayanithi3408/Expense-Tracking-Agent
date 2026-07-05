import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, TrendingUp, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function strength(pw) {
  let s = 0
  if (pw.length >= 8)        s++
  if (/[A-Z]/.test(pw))     s++
  if (/[0-9]/.test(pw))     s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({ firstName:'', lastName:'', mobile:'', email:'', password:'', confirm:'' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handle = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 8) return setError('Password must be at least 8 characters')
    if (!/^\d{10}$/.test(form.mobile)) return setError('Enter valid 10-digit mobile number')
    setLoading(true)
    try {
      await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, mobile: form.mobile, password: form.password })
      toast.success('Account created!')
      nav('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const s = strength(form.password)
  const barColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-['Poppins']">ExpenseAI</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest">Ledger Console</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-1">Create account</h1>
          <p className="text-slate-400 text-sm mb-6">Start tracking your expenses today</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-5">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handle} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">First Name *</label>
                <input className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Arjun" value={form.firstName} onChange={set('firstName')} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                <input className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Sharma" value={form.lastName} onChange={set('lastName')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Mobile Number *</label>
              <div className="flex">
                <span className="bg-slate-700 border border-slate-600 text-slate-400 px-3 py-2.5 rounded-l-lg text-sm border-r-0">+91</span>
                <input className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-r-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="9876543210" maxLength={10} value={form.mobile} onChange={set('mobile')} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Email Address *</label>
              <input type="email"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="arjun@gmail.com" value={form.email} onChange={set('email')} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Password *</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 pr-11 text-sm focus:outline-none focus:border-emerald-500 transition"
                  placeholder="Min 8 characters" value={form.password} onChange={set('password')} required />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= s ? barColors[s-1] : 'bg-slate-700'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">{strengthLabel[s]}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password *</label>
              <input type="password"
                className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
                placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition text-sm mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
