import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../components/Layout'
import api from '../api'
import toast from 'react-hot-toast'
import { Save, User, Bell, Shield, Link2, BarChart2, Database, Lock } from 'lucide-react'

const SECTIONS = [
  { id:'profile',       label:'My Profile',           icon:User },
  { id:'preferences',   label:'Preferences',          icon:BarChart2 },
  { id:'notifications', label:'Notifications',        icon:Bell },
  { id:'security',      label:'Security',             icon:Shield },
  { id:'budget',        label:'Budget Limits',        icon:BarChart2 },
  { id:'integrations',  label:'Integrations',         icon:Link2 },
  { id:'data',          label:'Data & Privacy',       icon:Database },
]

function Toggle({ value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`switch ${value ? 'switch-on' : ''}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${value ? 'left-4' : 'left-0.5'}`}/>
    </button>
  )
}

function SettingRow({ title, sub, children }) {
  return (
    <div className="flex items-center gap-5 py-3.5 border-b border-ink/8 last:border-0">
      <div className="flex-1">
        <div className="text-sm font-medium text-ink">{title}</div>
        {sub && <div className="text-xs text-ink-soft mt-0.5 leading-relaxed">{sub}</div>}
      </div>
      {children}
    </div>
  )
}

export default function Settings() {
  const { user, updateUser } = useAuth()
  const { lang, setLang } = useLang()
  const [active, setActive] = useState('profile')
  const [saving, setSaving] = useState(false)

  const [profile, setProfile] = useState({
    firstName: '', lastName: '', mobile: '', email: '', pan: ''
  })
  const [prefs, setPrefs] = useState({ currency:'INR', language:'en', dateFormat:'DD/MM/YYYY', fy:'april' })
  const [notif, setNotif] = useState({
    largeTransaction:true, weeklySummary:true, budgetWarning:true,
    suspiciousActivity:true, billReminders:false
  })
  const [sec, setSec] = useState({ twoFactor:true, confirmLarge:true, confirmCategory:true })
  const [budget, setBudget] = useState({
    food:8000, transport:3000, shopping:5000, subscriptions:1500, health:2000, entertainment:2500
  })
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' })

  // Load user data into form fields
  useEffect(() => {
    if (!user) return
    setProfile({
      firstName: user.firstName || '',
      lastName:  user.lastName  || '',
      mobile:    user.mobile    || '',
      email:     user.email     || '',
      pan:       user.pan       || '',
    })
    setPrefs(p => ({
      ...p,
      currency:   user.currency   || 'INR',
      language:   user.language   || 'en',
      dateFormat: user.dateFormat || 'DD/MM/YYYY',
    }))
    if (user.notifications) setNotif(user.notifications)
    if (user.budgetLimits)  setBudget(user.budgetLimits)
    setSec(s => ({ ...s, twoFactor: user.twoFactorEnabled ?? true }))
  }, [user])

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api.patch('/auth/profile', {
        firstName:        profile.firstName,
        lastName:         profile.lastName,
        mobile:           profile.mobile,
        pan:              profile.pan,
        currency:         prefs.currency,
        language:         prefs.language,
        dateFormat:       prefs.dateFormat,
        budgetLimits:     budget,
        notifications:    notif,
        twoFactorEnabled: sec.twoFactor,
      })
      updateUser(updated.data)
      setLang(prefs.language)
      toast.success('Settings saved successfully')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (pwForm.next !== pwForm.confirm) { toast.error('Passwords do not match'); return }
    if (pwForm.next.length < 8) { toast.error('Password must be at least 8 characters'); return }
    try {
      await api.patch('/auth/password', { currentPassword: pwForm.current, newPassword: pwForm.next })
      toast.success('Password updated')
      setPwForm({ current:'', next:'', confirm:'' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    }
  }

  const initials = ((profile.firstName?.charAt(0)||'') + (profile.lastName?.charAt(0)||'')).toUpperCase() || '?'

  return (
    <div className="p-8 pb-12">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-amber font-semibold mb-1">Configure</div>
          <h1 className="font-display text-2xl font-semibold text-paper">Settings</h1>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          <Save size={14}/>{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-5 items-start">
        {/* Sidebar nav */}
        <div className="card-navy p-2 space-y-0.5 sticky top-4">
          {SECTIONS.map(s => {
            const Icon = s.icon
            return (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-md text-sm transition-colors
                  ${active===s.id ? 'bg-verde text-paper font-medium' : 'text-pencil-navy hover:bg-wire-soft hover:text-paper'}`}>
                <Icon size={14}/>{s.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="space-y-4">

          {/* PROFILE */}
          {active === 'profile' && (
            <div className="card">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">My Profile · Account Details</div>
              <div className="flex items-start gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-verde flex items-center justify-center text-paper text-xl font-mono font-bold shrink-0 shadow-card">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-ink font-display">
                    {profile.firstName} {profile.lastName}
                  </div>
                  <div className="text-sm text-ink-soft">{profile.email}</div>
                  <div className="text-sm text-ink-soft">{profile.mobile ? `+91 ${profile.mobile}` : ''}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label:'First Name *', key:'firstName', placeholder:'Arjun' },
                  { label:'Last Name',   key:'lastName',  placeholder:'Sharma' },
                  { label:'Email Address *', key:'email',  placeholder:'arjun@gmail.com', type:'email' },
                  { label:'PAN Number',  key:'pan',       placeholder:'ABCDE1234F' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input className="input" type={f.type||'text'} placeholder={f.placeholder}
                      value={profile[f.key]} onChange={e=>setProfile(p=>({...p,[f.key]:e.target.value}))}/>
                  </div>
                ))}
                <div>
                  <label className="label">Mobile Number *</label>
                  <div className="flex">
                    <span className="px-3 py-2.5 bg-paper-dim border border-ink/20 border-r-0 rounded-l-md text-sm text-ink-soft">+91</span>
                    <input className="input rounded-l-none" type="tel" placeholder="9876543210" maxLength="10"
                      value={profile.mobile} onChange={e=>setProfile(p=>({...p,mobile:e.target.value}))}/>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREFERENCES */}
          {active === 'preferences' && (
            <div className="card">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">Display & Regional Settings</div>
              <SettingRow title="Default Currency" sub="All amounts across the app will be shown in this currency">
                <select className="input w-52" value={prefs.currency} onChange={e=>setPrefs(p=>({...p,currency:e.target.value}))}>
                  {[['INR','Rs - Indian Rupee'],['USD','$ - US Dollar'],['EUR','€ - Euro'],['GBP','£ - British Pound'],
                    ['AED','AED - UAE Dirham'],['SGD','S$ - Singapore Dollar'],['CAD','C$ - Canadian Dollar'],
                    ['AUD','A$ - Australian Dollar'],['JPY','¥ - Japanese Yen'],['CHF','Fr - Swiss Franc']
                  ].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </SettingRow>
              <SettingRow title="Language" sub="Interface language for menus and labels">
                <select className="input w-52" value={prefs.language} onChange={e=>setPrefs(p=>({...p,language:e.target.value}))}>
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="ta">Tamil (தமிழ்)</option>
                  <option value="te">Telugu (తెలుగు)</option>
                  <option value="mr">Marathi (मराठी)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                </select>
              </SettingRow>
              <SettingRow title="Date Format" sub="How dates are displayed across the ledger">
                <select className="input w-52" value={prefs.dateFormat} onChange={e=>setPrefs(p=>({...p,dateFormat:e.target.value}))}>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Indian)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                </select>
              </SettingRow>
              <SettingRow title="Financial Year Start" sub="Used for annual reports and budget resets">
                <select className="input w-52" value={prefs.fy} onChange={e=>setPrefs(p=>({...p,fy:e.target.value}))}>
                  <option value="april">April (Indian FY)</option>
                  <option value="january">January (Calendar Year)</option>
                </select>
              </SettingRow>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {active === 'notifications' && (
            <div className="card">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">Alerts & Reminders</div>
              {[
                { key:'largeTransaction', title:'Large transaction alert', sub:'Notify when any single spend exceeds Rs 5,000' },
                { key:'weeklySummary',    title:'Weekly spending summary', sub:'Get a digest every Monday on WhatsApp / email' },
                { key:'budgetWarning',    title:'Budget overspend warning', sub:'Alert when you cross 80% of any category budget' },
                { key:'suspiciousActivity',title:'Suspicious activity alert', sub:'Instant notification for flagged or duplicate transactions' },
                { key:'billReminders',    title:'Bill due reminders', sub:'Remind 3 days before a recurring payment is due' },
              ].map(n => (
                <SettingRow key={n.key} title={n.title} sub={n.sub}>
                  <Toggle value={notif[n.key]} onChange={v=>setNotif(p=>({...p,[n.key]:v}))}/>
                </SettingRow>
              ))}
            </div>
          )}

          {/* SECURITY */}
          {active === 'security' && (
            <div className="space-y-4">
              <div className="card">
                <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">Security Settings</div>
                <SettingRow title="Two-factor authentication (2FA)" sub={`OTP on mobile +91 ${profile.mobile || '—'} for every login`}>
                  <Toggle value={sec.twoFactor} onChange={v=>setSec(p=>({...p,twoFactor:v}))}/>
                </SettingRow>
                <SettingRow title="Confirm before logging spend > Rs 10,000" sub="Agent asks before writing large transactions to the ledger">
                  <Toggle value={sec.confirmLarge} onChange={v=>setSec(p=>({...p,confirmLarge:v}))}/>
                </SettingRow>
                <SettingRow title="Confirm before creating a new category" sub="Prevents silent category sprawl in the sheet">
                  <Toggle value={sec.confirmCategory} onChange={v=>setSec(p=>({...p,confirmCategory:v}))}/>
                </SettingRow>
              </div>
              <div className="card">
                <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">Change Password</div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label:'Current Password', key:'current' },
                    { label:'New Password',     key:'next' },
                    { label:'Confirm New',      key:'confirm' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="label">{f.label}</label>
                      <input className="input" type="password" placeholder="••••••••"
                        value={pwForm[f.key]} onChange={e=>setPwForm(p=>({...p,[f.key]:e.target.value}))}/>
                    </div>
                  ))}
                </div>
                <button onClick={changePassword} className="btn btn-primary mt-4">
                  <Lock size={13}/>Update Password
                </button>
              </div>
            </div>
          )}

          {/* BUDGET */}
          {active === 'budget' && (
            <div className="card">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">Monthly Budget Limits</div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(budget).map(([k,v]) => (
                  <div key={k}>
                    <label className="label capitalize">{k}</label>
                    <div className="flex">
                      <span className="px-3 py-2.5 bg-paper-dim border border-ink/20 border-r-0 rounded-l-md text-sm text-ink-soft">Rs</span>
                      <input className="input rounded-l-none" type="number" value={v}
                        onChange={e=>setBudget(p=>({...p,[k]:parseInt(e.target.value)||0}))}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INTEGRATIONS */}
          {active === 'integrations' && (
            <div className="card">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">Connected Services</div>
              {[
                { name:'Telegram Bot', meta:'@expenseai_bot connected', on:true },
                { name:'Google Sheets', meta:'Writing to "2026 Ledger"', on:true },
                { name:'OpenAI', meta:'gpt-4.1 · categorization + chat', on:true },
                { name:'Plaid (bank/card feeds)', meta:'2 accounts connected', on:true },
              ].map((i,idx) => (
                <div key={idx} className="flex items-center gap-3 py-3.5 border-b border-ink/8 last:border-0">
                  <div className="w-9 h-9 rounded-lg bg-paper-dim flex items-center justify-center shrink-0">
                    <Link2 size={15} className="text-verde-deep"/>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-ink">{i.name}</div>
                    <div className="text-xs text-ink-soft">{i.meta}</div>
                  </div>
                  <div className={`switch ${i.on?'switch-on':''}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${i.on?'left-4':'left-0.5'}`}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DATA */}
          {active === 'data' && (
            <div className="card">
              <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">Data & Privacy</div>
              <SettingRow title="Export ledger as CSV" sub="Download all transactions in spreadsheet format">
                <button className="btn btn-sm" onClick={()=>toast.success('CSV export started')}>Export CSV</button>
              </SettingRow>
              <SettingRow title="Export as PDF report" sub="Monthly financial summary — July 2026">
                <button className="btn btn-sm" onClick={()=>toast.success('PDF generation started')}>Export PDF</button>
              </SettingRow>
              <SettingRow title={<span className="text-danger">Delete Account</span>} sub="Permanently remove all your data from ExpenseAI">
                <button className="btn btn-sm btn-danger" onClick={()=>{
                  if(window.confirm('This will permanently delete your account. Continue?'))
                    toast('Account deletion request submitted')
                }}>Delete</button>
              </SettingRow>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
