import { useEffect, useState } from 'react'
import api from '../api'
import { Plus, Trash2, Eye, RefreshCw, Landmark } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const BANK_COLORS = ['#10b981','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4']

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const EMPTY = { bankName:'', accountType:'Savings', accountNumber:'', holderName:'', balance:'', currency:'INR', color:'#10b981' }

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const nav = useNavigate()

  const load = () => {
    api.get('/accounts').then(r => setAccounts(r.data)).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/accounts', { ...form, balance: parseFloat(form.balance) || 0 })
      toast.success('Account connected!')
      setModal(false)
      setForm(EMPTY)
      load()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id, name) => {
    if (!confirm(`Remove "${name}" and all its transactions?`)) return
    try {
      await api.delete(`/accounts/${id}`)
      toast.success('Account removed')
      load()
    } catch { toast.error('Failed to remove') }
  }

  const fmt = (n, cur = 'INR') => {
    const sym = { INR:'₹', USD:'$', EUR:'€', GBP:'£' }[cur] || cur + ' '
    return (n >= 0 ? '+' : '-') + sym + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-emerald-500 uppercase tracking-widest font-semibold mb-1">Payments</p>
          <h1 className="text-2xl font-bold text-white">Bank Accounts</h1>
          <p className="text-slate-400 text-sm mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''} connected</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition">
          <Plus size={16} /> Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Landmark size={40} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No accounts yet. Click <b>Add Account</b> to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <div key={acc._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition">
              {/* Color bar */}
              <div className="h-1" style={{ background: acc.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: acc.color }}>
                      {acc.bankName.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{acc.bankName} {acc.accountNumber}</p>
                      <p className="text-xs text-slate-400">{acc.accountType} · {acc.holderName}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    acc.status === 'active' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {acc.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-500 mb-1">Balance</p>
                  <p className={`text-xl font-bold font-mono ${acc.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {fmt(acc.balance, acc.currency)}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <span className="bg-slate-800 px-2 py-1 rounded">{acc.transactionCount} txns</span>
                  {acc.pendingCount > 0 && <span className="bg-amber-600/20 text-amber-400 px-2 py-1 rounded">{acc.pendingCount} pending</span>}
                  {acc.flaggedCount > 0 && <span className="bg-red-600/20 text-red-400 px-2 py-1 rounded">{acc.flaggedCount} flagged</span>}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => nav(`/transactions?accountId=${acc._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg transition">
                    <Eye size={13} /> View
                  </button>
                  <button onClick={() => { toast.success('Account synced'); load() }}
                    className="flex items-center justify-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 px-3 rounded-lg transition">
                    <RefreshCw size={13} />
                  </button>
                  <button onClick={() => remove(acc._id, acc.bankName + ' ' + acc.accountNumber)}
                    className="flex items-center justify-center gap-1.5 text-xs bg-red-600/10 hover:bg-red-600/20 text-red-400 py-2 px-3 rounded-lg transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Bank Account">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Bank Name *</label>
              <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="SBI, HDFC, ICICI…" value={form.bankName} onChange={set('bankName')} required />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Account Type *</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                value={form.accountType} onChange={set('accountType')}>
                {['Savings','Checking','Credit Card','Investment'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Last 4 Digits *</label>
              <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="••4471" value={form.accountNumber} onChange={set('accountNumber')} required />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Currency</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                value={form.currency} onChange={set('currency')}>
                {['INR','USD','EUR','GBP','AED','SGD'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Account Holder Name *</label>
            <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Full name" value={form.holderName} onChange={set('holderName')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Current Balance</label>
              <input type="number" step="0.01"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="0.00" value={form.balance} onChange={set('balance')} />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Card Color</label>
              <div className="flex gap-2 pt-1">
                {BANK_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-6 h-6 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''}`}
                    style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition">
              {saving ? 'Connecting…' : 'Connect Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
