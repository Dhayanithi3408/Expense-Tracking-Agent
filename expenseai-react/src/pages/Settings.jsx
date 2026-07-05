import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import toast from 'react-hot-toast'
import { User, Lock, Globe, Bell, Database, Save, Eye, EyeOff } from 'lucide-react'

const LANGS = [
  { code:'en', label:'English' },
  { code:'hi', label:'Hindi - हिन्दी' },
  { code:'ta', label:'Tamil - தமிழ்' },
  { code:'te', label:'Telugu - తెలుగు' },
  { code:'mr', label:'Marathi - मराठी' },
  { code:'bn', label:'Bengali - বাংলা' },
]

const CURRENCIES = [
  { code:'INR', symbol:'₹', name:'Indian Rupee' },
  { code:'USD', symbol:'$', name:'US Dollar' },
  { code:'EUR', symbol:'€', name:'Euro' },
  { code:'GBP', symbol:'£', name:'British Pound' },
  { code:'AED', symbol:'د.إ', name:'UAE Dirham' },
  { code:'SGD', symbol:'S$', name:'Singapore Dollar' },
  { code:'CAD', symbol:'C$', name:'Canadian Dollar' },
  { code:'AUD', symbol:'A$', name:'Australian Dollar' },
  { code:'JPY', symbol:'¥', name:'Japanese Yen' },
  { code:'CHF', symbol:'Fr', name:'Swiss Franc' },
]

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
          <Icon size={15} className="text-emerald-400" />
        </div>
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Row({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-800 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!on)}
      className={`relative w-10 h-5 rounded-full transition-colors ${on ? 'bg-emerald-600' : 'bg-slate-700'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'left-5' : 'left-0.5'}`} />
    </button>
  )
}

function initials(u) {
  if (!u) return '?'
  return [(u.firstName||'')[0], (u.lastName||'')[0]].filter(Boolean).join('').toUpperCase() || '?'
}

export default function Settings() {
  const { user, updateUser } = useAuth()

  // Profile
  const [profile, setProfile] = useState({
    firstName: '', lastName: '', mobile: '', pan: '', language: 'en', currency: 'INR'
  })
  const [savingProfile, setSavingProfile] = useState(false)

  // Password
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  // Notifications (local toggles)
  const [notifs, setNotifs] = useState({
    largeTransaction: true, weeklySummary: true,
    budgetWarning: true, suspiciousActivity: true, billReminders: false
  })

  // Fill form from user data
  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName || '',
        lastName:  user.lastName  || '',
        mobile:    user.mobile    || '',
        pan:       user.pan       || '',
        language:  user.language  || 'en',
        currency:  user.currency  || 'INR',
      })
    }
  }, [user])

  const setP = k => e => setProfile(p => ({ ...p, [k]: e.target.value }))

  const saveProfile = async e => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await api.patch('/auth/profile', profile)
      updateUser(updated.data)
      toast.success('Profile saved!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async e => {
    e.preventDefault()
    if (pw.next !== pw.confirm) return toast.error('Passwords do not match')
    if (pw.next.length < 8) return toast.error('Min 8 characters')
    setSavingPw(true)
    try {
      await api.patch('/auth/password', { currentPassword: pw.current, newPassword: pw.next })
      toast.success('Password updated!')
      setPw({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setSavingPw(false)
    }
  }

  const inputCls = "w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition"
  const selectCls = "bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 transition min-w-[200px]"

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <p className="text-xs text-emerald-500 uppercase tracking-widest font-semibold mb-1">Configure</p>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your profile, preferences and security</p>
      </div>

      {/* ── Profile ── */}
      <Section icon={User} title="My Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
              {initials(profile.firstName ? profile : user)}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {profile.firstName || user?.firstName} {profile.lastName || user?.lastName}
              </p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">First Name *</label>
              <input className={inputCls} value={profile.firstName} onChange={setP('firstName')} placeholder="First name" required />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Last Name</label>
              <input className={inputCls} value={profile.lastName} onChange={setP('lastName')} placeholder="Last name" />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Mobile Number</label>
              <div className="flex">
                <span className="bg-slate-700 border border-slate-600 text-slate-400 px-3 py-2.5 rounded-l-lg text-sm border-r-0 whitespace-nowrap">+91</span>
                <input className={`${inputCls} rounded-l-none`} value={profile.mobile} onChange={setP('mobile')} placeholder="9876543210" maxLength={10} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">PAN Number</label>
              <input className={inputCls} value={profile.pan} onChange={setP('pan')} placeholder="ABCDE1234F" maxLength={10} />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Email Address</label>
              <input className={`${inputCls} opacity-60 cursor-not-allowed`} value={user?.email || ''} readOnly />
            </div>
          </div>

          <button type="submit" disabled={savingProfile}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition">
            <Save size={14} />
            {savingProfile ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </Section>

      {/* ── Preferences ── */}
      <Section icon={Globe} title="Preferences">
        <Row label="Language" sub="Interface language for menus and labels">
          <select className={selectCls} value={profile.language} onChange={setP('language')}>
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </Row>
        <Row label="Default Currency" sub="All amounts displayed in this currency">
          <select className={selectCls} value={profile.currency} onChange={setP('currency')}>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.flag || ''} {c.code} - {c.name} ({c.symbol})</option>
            ))}
          </select>
        </Row>
        <Row label="Date Format" sub="How dates appear in the ledger">
          <select className={selectCls} defaultValue="DD/MM/YYYY">
            <option>DD/MM/YYYY (Indian)</option>
            <option>MM/DD/YYYY</option>
            <option>YYYY-MM-DD (ISO)</option>
          </select>
        </Row>
        <Row label="Financial Year Start" sub="Used for annual reports and budget resets">
          <select className={selectCls} defaultValue="april">
            <option value="april">April (Indian FY)</option>
            <option value="january">January (Calendar)</option>
          </select>
        </Row>
        <div className="pt-3">
          <button onClick={saveProfile} disabled={savingProfile}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition">
            <Save size={14} />
            {savingProfile ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </Section>

      {/* ── Notifications ── */}
      <Section icon={Bell} title="Notifications">
        {[
          { key:'largeTransaction',   label:'Large transaction alert',  sub:'Notify when any spend exceeds ₹5,000' },
          { key:'weeklySummary',      label:'Weekly spending summary',  sub:'Digest every Monday on WhatsApp / email' },
          { key:'budgetWarning',      label:'Budget overspend warning', sub:'Alert at 80% of any category budget' },
          { key:'suspiciousActivity', label:'Suspicious activity alert',sub:'Instant alert for flagged transactions' },
          { key:'billReminders',      label:'Bill due reminders',       sub:'3 days before a recurring payment' },
        ].map(({ key, label, sub }) => (
          <Row key={key} label={label} sub={sub}>
            <Toggle on={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
          </Row>
        ))}
      </Section>

      {/* ── Security ── */}
      <Section icon={Lock} title="Security">
        <Row label="Two-factor authentication" sub="OTP on every login">
          <Toggle on={true} onChange={() => toast('2FA settings require SMS provider setup')} />
        </Row>
        <Row label="Confirm large transactions" sub="Confirm before logging spend > ₹10,000">
          <Toggle on={true} onChange={() => {}} />
        </Row>

        <div className="pt-4 mt-2 border-t border-slate-800">
          <p className="text-sm font-medium text-white mb-4">Change Password</p>
          <form onSubmit={savePassword} className="space-y-3">
            {[
              { key:'current', label:'Current Password', ph:'Enter current password' },
              { key:'next',    label:'New Password',     ph:'Min 8 characters' },
              { key:'confirm', label:'Confirm Password', ph:'Repeat new password' },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">{label}</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'}
                    className={`${inputCls} pr-10`}
                    placeholder={ph}
                    value={pw[key]}
                    onChange={e => setPw(p => ({ ...p, [key]: e.target.value }))}
                    required />
                  {key === 'current' && (
                    <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" disabled={savingPw}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition">
              <Lock size={14} />
              {savingPw ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </Section>

      {/* ── Data ── */}
      <Section icon={Database} title="Data & Privacy">
        <Row label="Export ledger as CSV" sub="Download all transactions">
          <button onClick={() => toast('CSV export started!')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg transition">Export CSV</button>
        </Row>
        <Row label="Export as PDF report" sub="Monthly financial summary">
          <button onClick={() => toast('PDF generation started!')} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg transition">Export PDF</button>
        </Row>
        <Row label={<span className="text-red-400">Delete Account</span>} sub="Permanently remove all data">
          <button onClick={() => { if(confirm('Delete your account permanently?')) toast.error('Request submitted') }}
            className="bg-red-600/10 hover:bg-red-600/20 text-red-400 text-sm px-4 py-2 rounded-lg transition border border-red-600/20">
            Delete
          </button>
        </Row>
      </Section>
    </div>
  )
}
