import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, X, RefreshCw, Landmark } from 'lucide-react'

const COLORS = ['#3C7A6A','#C97A2B','#A8432F','#8FA39C','#2C5C50','#1A2E40']

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-navy-deep/70 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-paper rounded-lg shadow-lift w-full max-w-lg p-6" onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default function Accounts() {
  const { t } = useOutletContext()
  const [accounts, setAccounts] = useState([])
  const [stats,    setStats]    = useState({})
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({ bankName:'', accountType:'Savings', accountNumber:'', holderName:'', balance:'', currency:'INR', color:'#3C7A6A' })
  const [saving,   setSaving]   = useState(false)

  const load = async () => {
    try {
      const [a, s] = await Promise.all([api.get('/accounts'), api.get('/transactions/stats')])
      setAccounts(a.data)
      setStats(s.data)
    } catch { toast.error('Failed to load accounts') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/accounts', form)
      toast.success('Account connected!')
      setModal(false)
      setForm({ bankName:'', accountType:'Savings', accountNumber:'', holderName:'', balance:'', currency:'INR', color:'#3C7A6A' })
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const del = async (id, name) => {
    if (!window.confirm(`Remove "${name}" and all its transactions?`)) return
    try { await api.delete(`/accounts/${id}`); toast.success('Removed'); load() }
    catch { toast.error('Failed to remove') }
  }

  const initials = (name) => name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="p-8 pb-12">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-amber font-semibold mb-1">Payment Tracking</div>
          <h1 className="font-display text-2xl font-semibold text-paper">{t.accounts}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="pill cursor-pointer hover:border-verde"><RefreshCw size={11}/>Refresh</button>
          <button onClick={()=>setModal(true)} className="btn btn-primary"><Plus size={14}/>Add Account</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <div className="card"><div className="stat-label">Total Balance</div><div className="stat-value">Rs {(stats.totalBalance||0).toLocaleString('en-IN')}</div><div className="stat-delta">across active accounts</div></div>
        <div className="card"><div className="stat-label">Active Accounts</div><div className="stat-value">{stats.activeAccounts||0}</div><div className="stat-delta">connected</div></div>
        <div className="card"><div className="stat-label">Pending Transactions</div><div className="stat-value text-amber">{stats.pendingTxns||0}</div><div className="stat-delta">awaiting clearance</div></div>
        <div className="card"><div className="stat-label">Flagged Items</div><div className="stat-value text-danger">{stats.flaggedTxns||0}</div><div className="stat-delta">need review</div></div>
      </div>

      {/* Account list */}
      {loading ? (
        <div className="card flex items-center justify-center py-16 text-ink-soft text-sm">Loading accounts…</div>
      ) : accounts.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-ink-soft">
          <Landmark size={36} className="opacity-30"/>
          <p className="text-sm">No accounts yet. Click <strong>Add Account</strong> to connect one.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {accounts.map(acc => (
            <div key={acc._id} className="card overflow-hidden">
              <div className="flex items-center gap-4 pb-4 border-b border-ink/8">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-mono font-bold shrink-0"
                  style={{background: acc.color}}>
                  {initials(acc.bankName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink">{acc.bankName} {acc.accountNumber}</div>
                  <div className="text-xs text-ink-soft mt-0.5">{acc.accountType} &middot; {acc.holderName}
                    <span className={`ml-2 badge ${acc.status==='active'?'badge-green':'badge-gray'}`}>
                      {acc.status==='active' ? 'Active' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono text-lg font-bold ${acc.balance>=0?'text-verde-deep':'text-danger'}`}>
                    {acc.balance>=0?'+':''}{acc.currency==='INR'?'Rs ':'$'}{Math.abs(acc.balance).toLocaleString('en-IN',{minimumFractionDigits:2})}
                  </div>
                  <div className="text-xs text-ink-soft">{acc.currency} balance</div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-3 text-xs text-ink-soft flex-wrap">
                <span className="badge badge-gray">{acc.transactionCount||0} transactions</span>
                {(acc.pendingCount||0)>0 && <span className="badge badge-amber">{acc.pendingCount} pending</span>}
                {(acc.flaggedCount||0)>0 && <span className="badge badge-red">{acc.flaggedCount} flagged</span>}
                <div className="ml-auto flex gap-2">
                  <button className="btn btn-sm">View transactions</button>
                  <button onClick={()=>del(acc._id, `${acc.bankName} ${acc.accountNumber}`)} className="btn btn-sm btn-danger">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      <Modal open={modal} onClose={()=>setModal(false)}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">Add Bank Account</h2>
          <button onClick={()=>setModal(false)} className="text-ink-soft hover:text-ink"><X size={18}/></button>
        </div>
        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="label">Bank Name *</label>
            <input className="input" placeholder="e.g. SBI, HDFC, ICICI" value={form.bankName}
              onChange={e=>setForm(p=>({...p,bankName:e.target.value}))} required/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Account Type *</label>
              <select className="input" value={form.accountType} onChange={e=>setForm(p=>({...p,accountType:e.target.value}))}>
                {['Savings','Checking','Credit Card','Investment'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Last 4 Digits *</label>
              <input className="input" placeholder="••4471" value={form.accountNumber}
                onChange={e=>setForm(p=>({...p,accountNumber:e.target.value}))} required/>
            </div>
          </div>
          <div>
            <label className="label">Account Holder Name *</label>
            <input className="input" placeholder="Full name" value={form.holderName}
              onChange={e=>setForm(p=>({...p,holderName:e.target.value}))} required/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Current Balance</label>
              <input className="input" type="number" step="0.01" placeholder="0.00" value={form.balance}
                onChange={e=>setForm(p=>({...p,balance:e.target.value}))}/>
            </div>
            <div>
              <label className="label">Currency</label>
              <select className="input" value={form.currency} onChange={e=>setForm(p=>({...p,currency:e.target.value}))}>
                {['INR','USD','EUR','GBP'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Card Color</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c=>(
                <button key={c} type="button" onClick={()=>setForm(p=>({...p,color:c}))}
                  className={`w-7 h-7 rounded-full transition-transform ${form.color===c?'scale-125 ring-2 ring-offset-1 ring-white':''}`}
                  style={{background:c}}/>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={()=>setModal(false)} className="btn">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Connecting…' : 'Connect Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
