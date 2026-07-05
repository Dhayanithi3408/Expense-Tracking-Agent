import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, Share2, Clock, MessageCircle, TrendingUp,
  Landmark, CreditCard, Settings, LogOut, Globe
} from 'lucide-react'

const LANGS = [
  { code:'en', label:'English' },
  { code:'hi', label:'हिन्दी' },
  { code:'ta', label:'தமிழ்' },
  { code:'te', label:'తెలుగు' },
  { code:'mr', label:'मराठी' },
  { code:'bn', label:'বাংলা' },
]

const TRANSLATIONS = {
  en: {
    workspace:'Workspace', overview:'Overview', sources:'Sources & Ingestion',
    transactions:'Transactions & AI', chat:'Ask ExpenseAI', insights:'Insights & Forecast',
    payments:'Payments', accounts:'Bank Accounts', online_txn:'Online Transactions',
    configure:'Configure', settings:'Settings',
    synced:'Synced 2m ago', log_expense:'Log Expense',
    this_month:'This month · Jul 2026',
    greeting: (name) => `Namaste, ${name}. Here's your ledger.`,
  },
  hi: {
    workspace:'कार्यस्थान', overview:'अवलोकन', sources:'स्रोत और संग्रहण',
    transactions:'लेनदेन और AI', chat:'ExpenseAI से पूछें', insights:'अंतर्दृष्टि और पूर्वानुमान',
    payments:'भुगतान', accounts:'बैंक खाते', online_txn:'ऑनलाइन लेनदेन',
    configure:'कॉन्फ़िगर', settings:'सेटिंग्स',
    synced:'2 मिनट पहले सिंक', log_expense:'खर्च दर्ज करें',
    this_month:'इस महीने · जुलाई 2026',
    greeting: (name) => `नमस्ते, ${name}. यह आपका लेजर है।`,
  },
  ta: {
    workspace:'பணியிடம்', overview:'கண்ணோட்டம்', sources:'மூலங்கள்',
    transactions:'பரிவர்த்தனைகள்', chat:'கேள்', insights:'நுண்ணறிவு',
    payments:'கொடுப்பனவுகள்', accounts:'வங்கி கணக்குகள்', online_txn:'ஆன்லைன் பரிவர்த்தனைகள்',
    configure:'அமைக்க', settings:'அமைப்புகள்',
    synced:'2 நிமிடம் முன்பு', log_expense:'செலவு பதிவு',
    this_month:'இந்த மாதம் · ஜூலை 2026',
    greeting: (name) => `வணக்கம், ${name}. உங்கள் லெட்ஜர் இங்கே.`,
  },
  te: {
    workspace:'వర్క్‌స్పేస్', overview:'అవలోకనం', sources:'మూలాలు',
    transactions:'లావాదేవీలు', chat:'అడగండి', insights:'అంతర్దృష్టి',
    payments:'చెల్లింపులు', accounts:'బ్యాంక్ ఖాతాలు', online_txn:'ఆన్‌లైన్ లావాదేవీలు',
    configure:'కాన్ఫిగర్', settings:'సెట్టింగ్‌లు',
    synced:'2 నిమిషాల క్రితం', log_expense:'ఖర్చు నమోదు',
    this_month:'ఈ నెల · జులై 2026',
    greeting: (name) => `నమస్కారం, ${name}. మీ లెడ్జర్ ఇక్కడ ఉంది.`,
  },
  mr: {
    workspace:'कार्यक्षेत्र', overview:'विहंगावलोकन', sources:'स्रोत',
    transactions:'व्यवहार', chat:'विचारा', insights:'अंतर्दृष्टी',
    payments:'देयके', accounts:'बँक खाती', online_txn:'ऑनलाइन व्यवहार',
    configure:'कॉन्फिगर', settings:'सेटिंग्ज',
    synced:'२ मिनिटांपूर्वी', log_expense:'खर्च नोंदवा',
    this_month:'या महिन्यात · जुलै 2026',
    greeting: (name) => `नमस्कार, ${name}. हे आपले लेजर आहे.`,
  },
  bn: {
    workspace:'ওয়ার্কস্পেস', overview:'ওভারভিউ', sources:'উৎস',
    transactions:'লেনদেন', chat:'জিজ্ঞাসা করুন', insights:'অন্তর্দৃষ্টি',
    payments:'পেমেন্ট', accounts:'ব্যাংক অ্যাকাউন্ট', online_txn:'অনলাইন লেনদেন',
    configure:'কনফিগার', settings:'সেটিংস',
    synced:'২ মিনিট আগে সিঙ্ক', log_expense:'ব্যয় লগ করুন',
    this_month:'এই মাস · জুলাই ২০২৬',
    greeting: (name) => `নমস্কার, ${name}। এটি আপনার লেজার।`,
  },
}

export const LangContext = React.createContext({ lang:'en', t: TRANSLATIONS.en, setLang:()=>{} })
export const useLang = () => React.useContext(LangContext)

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [lang, setLangState] = useState(user?.language || 'en')
  const [showLang, setShowLang] = useState(false)

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en

  const setLang = (code) => {
    setLangState(code)
    setShowLang(false)
  }

  const initials = user?.initials || (user?.firstName?.charAt(0) || '?').toUpperCase()
  const fullName = user?.fullName || user?.firstName || 'User'

  const nav = [
    { to:'/',            icon:<LayoutDashboard size={16}/>, label: t.overview },
    { to:'/sources',     icon:<Share2 size={16}/>,         label: t.sources },
    { to:'/transactions',icon:<Clock size={16}/>,          label: t.transactions },
    { to:'/chat',        icon:<MessageCircle size={16}/>,  label: t.chat },
    { to:'/insights',    icon:<TrendingUp size={16}/>,     label: t.insights },
  ]
  const payNav = [
    { to:'/accounts', icon:<Landmark size={16}/>,   label: t.accounts },
    { to:'/payments', icon:<CreditCard size={16}/>, label: t.online_txn },
  ]

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="w-56 bg-navy-deep border-r border-wire flex flex-col sticky top-0 h-screen overflow-y-auto shrink-0">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-wire/50">
            <div className="w-8 h-8 rounded-full border-2 border-verde flex items-center justify-center rotate-[-6deg] text-verde shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M4 4h16v4H4zM4 10h10v4H4zM4 16h16v4H4z"/>
              </svg>
            </div>
            <div>
              <div className="font-display font-semibold text-paper text-base leading-tight">ExpenseAI</div>
              <div className="text-[10px] uppercase tracking-widest text-pencil-navy">Ledger Console</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5">
            <div className="text-[10px] uppercase tracking-widest text-pencil-navy/60 px-2 mb-2">{t.workspace}</div>
            {nav.map(n => (
              <NavLink key={n.to} to={n.to} end={n.to==='/'} className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-active' : ''}`}>
                {n.icon}<span>{n.label}</span>
              </NavLink>
            ))}
            <div className="text-[10px] uppercase tracking-widest text-pencil-navy/60 px-2 mt-4 mb-2">{t.payments}</div>
            {payNav.map(n => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-active' : ''}`}>
                {n.icon}<span>{n.label}</span>
              </NavLink>
            ))}
            <div className="text-[10px] uppercase tracking-widest text-pencil-navy/60 px-2 mt-4 mb-2">{t.configure}</div>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}>
              <Settings size={16}/><span>{t.settings}</span>
            </NavLink>
          </nav>

          {/* User footer */}
          <div className="border-t border-wire px-3 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-verde flex items-center justify-center text-paper text-xs font-mono font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-paper text-[12.5px] font-medium truncate">{fullName}</div>
              <div className="text-pencil-navy text-[10.5px] truncate">{user?.email || user?.mobile || ''}</div>
            </div>
            <button onClick={() => { logout(); navigate('/login') }} title="Sign out"
              className="text-pencil-navy hover:text-danger transition-colors p-1 rounded">
              <LogOut size={14}/>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 bg-navy min-h-screen" style={{
          background:'radial-gradient(1200px 500px at 90% -10%, rgba(60,122,106,0.08), transparent 60%), #0E1C29'
        }}>
          {/* Global topbar strip with lang switcher */}
          <div className="flex justify-end items-center px-8 py-3 border-b border-wire/30">
            <div className="relative">
              <button onClick={() => setShowLang(v => !v)}
                className="pill flex items-center gap-1.5 cursor-pointer hover:border-verde transition-colors">
                <Globe size={12}/>
                <span>{LANGS.find(l=>l.code===lang)?.label || 'English'}</span>
                <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>
              {showLang && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-navy-deep border border-wire rounded-lg shadow-lift z-50 overflow-hidden">
                  {LANGS.map(l => (
                    <button key={l.code} onClick={() => setLang(l.code)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-wire-soft
                        ${lang===l.code ? 'text-verde font-medium bg-wire-soft/50' : 'text-pencil-navy'}`}>
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Outlet context={{ lang, t, user }} />
        </div>
      </div>
    </LangContext.Provider>
  )
}
