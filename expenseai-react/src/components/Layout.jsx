import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Landmark, CreditCard, Settings, LogOut,
  TrendingUp, Globe
} from 'lucide-react'
import { useState } from 'react'

const LANGS = [
  { code:'en', label:'English' },
  { code:'hi', label:'हिन्दी' },
  { code:'ta', label:'தமிழ்' },
  { code:'te', label:'తెలుగు' },
  { code:'mr', label:'मराठी' },
  { code:'bn', label:'বাংলা' },
]

const NAV = [
  { to:'/',            icon: LayoutDashboard, label:'Dashboard' },
  { to:'/accounts',   icon: Landmark,        label:'Bank Accounts' },
  { to:'/transactions',icon: CreditCard,      label:'Transactions' },
  { to:'/settings',   icon: Settings,        label:'Settings' },
]

function initials(u) {
  if (!u) return '?'
  const parts = [(u.firstName||''), (u.lastName||'')].filter(Boolean)
  return parts.map(p => p[0]).join('').toUpperCase() || '?'
}

export default function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [lang, setLang] = useState(user?.language || 'en')
  const [langOpen, setLangOpen] = useState(false)

  const handleLogout = () => { logout(); nav('/login') }

  const changeLang = (code) => {
    setLang(code)
    setLangOpen(false)
    import('../api').then(m => m.default.patch('/auth/profile', { language: code }))
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col">

        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white font-['Poppins']">ExpenseAI</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Ledger Console</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-emerald-600/20 text-emerald-400 border-l-2 border-emerald-500'
                   : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`
              }>
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Language picker */}
        <div className="px-3 pb-2 relative">
          <button
            onClick={() => setLangOpen(o => !o)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-all"
          >
            <Globe size={16} />
            <span className="flex-1 text-left">
              {LANGS.find(l => l.code === lang)?.label || 'Language'}
            </span>
            <span className="text-xs text-slate-500">{lang.toUpperCase()}</span>
          </button>
          {langOpen && (
            <div className="absolute bottom-12 left-3 right-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => changeLang(l.code)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                    ${l.code === lang ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-700'}`}>
                  {l.label}
                  <span className="text-xs text-slate-500 ml-2">{l.code.toUpperCase()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-slate-800 pt-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials(user)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'User'}
              </div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
            <button onClick={handleLogout} title="Sign out"
              className="text-slate-500 hover:text-red-400 transition-colors p-1">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <Outlet />
      </main>
    </div>
  )
}
