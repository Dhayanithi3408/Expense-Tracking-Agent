import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api'
import { Plus, Flag, Trash2, ChevronDown, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const CATS = ['Uncategorized','Food & Drink','Shopping','Transport','Housing','Health','Subscriptions','Income','Transfer']
const EMPTY_TXN = { accountId:'', merchant:'', amount:'', category:'Uncategorized', method:'UPI', status:'pending', description:'' }

const STATUS_STYLE = {
  cleared: 'bg-emerald-600/20 text-emerald-400',
  pending: 'bg-amber-600/20 text-amber-400',
  failed:  'bg-red-600/20 text-red-400'
}

export default function Transactions() {
  const [params] = useSearchParams()
  const [txns, setTxns]           = useState([])
  const [accounts, setAccounts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [detail, setDetail]       = useState(null)
  const [form, setForm]           = useState(EMPTY_TXN)
  const [saving, setSaving]       = useState(false)
  const [filterAcc, setFilterAcc] = useState(params.get('accountId') || '')
  const [filterSts, setFilterSts] = useState('')

  const load = () => {
    let q = '/transactions?'
    if (filterAcc) q += `accountId=${filterAcc}&`
    if (filterSts) q += `status=${filterSts}&`
    api.get(q).then(r => setTxns(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { api.get('/accounts').then(r => setAccounts(r.data)) }, [])
  useEffect(() => { setLoading(true); load() }, [filterAcc, filterSts])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (!form.accountId) return toast.error('Select an account')
    setSaving(true)
    try {
      await api.post('/transactions', form)
      toast.success('Transaction saved!')
      setModal(false)
      setForm(EMPTY_TXN)
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const toggleFlag = async t => {
    await api.patch(`/transactions/${t._id}`, { flagged: !t.flagged })
    toast.success(t.flagged ? 'Flag removed' : 'Transaction flagged')
    load()
  }

  const remove = async t => {
    if (!confirm('Delete this transaction?')) return
    await api.delete(`/transactions/${t._id}`)
    toast.success('Deleted')
    setDetail(null)
    load()
  }

  const fmt = n => `${n >= 0 ? '+' : '-'}₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  const accName = id => { const a = accounts.find(a => a._id === id || a._id === id?._id); return a ? `${a.bankName} ${a.accountNumber}` : '—' }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs text-emerald-500 uppercase tracking-widest font-semibold mb-1">Payments</p>
          <h1 className="text-2xl font-bold text-white">Online Transactions</h1>
          <p className="text-slate-400 text-sm mt-1">{txns.length} transaction{txns.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={filterAcc} onChange={e => setFilterAcc(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option value="">All accounts</option>
          {accounts.map(a => <option key={a._id} value={a._id}>{a.bankName} {a.accountNumber}</option>)}
        </select>
        <select value={filterSts} onChange={e => setFilterSts(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option value="">All statuses</option>
          <option value="cleared">Cleared</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : txns.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Merchant</th>
                  <th className="text-left px-5 py-3 font-medium">Account</th>
                  <th className="text-left px-5 py-3 font-medium">Category</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {txns.map(t => (
                  <tr key={t._id} className="hover:bg-slate-800/50 cursor-pointer transition"
                    onClick={() => setDetail(t)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {t.flagged && <Flag size={12} className="text-amber-400 flex-shrink-0" />}
                        <span className="font-medium text-white">{t.merchant}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">{accName(t.account)}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded">{t.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {new Date(t.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[t.status] || ''}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold"
                      onClick={e => { e.stopPropagation() }}>
                      <span className={t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}>{fmt(t.amount)}</span>
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => toggleFlag(t)} title="Flag"
                          className={`p-1.5 rounded hover:bg-slate-700 transition ${t.flagged ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}`}>
                          <Flag size={13} />
                        </button>
                        <button onClick={() => remove(t)} title="Delete"
                          className="p-1.5 rounded hover:bg-red-600/20 text-slate-500 hover:text-red-400 transition">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Transaction">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Account *</label>
            <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              value={form.accountId} onChange={set('accountId')} required>
              <option value="">Select account</option>
              {accounts.map(a => <option key={a._id} value={a._id}>{a.bankName} {a.accountNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Merchant *</label>
            <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Swiggy, Amazon, Rent…" value={form.merchant} onChange={set('merchant')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Amount * <span className="text-slate-600 normal-case">(- for debit)</span></label>
              <input type="number" step="0.01"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="-499" value={form.amount} onChange={set('amount')} required />
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Category</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                value={form.category} onChange={set('category')}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Method</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                value={form.method} onChange={set('method')}>
                {['UPI','Card','Bank Transfer','Online','Cash'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Status</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                value={form.status} onChange={set('status')}>
                {['pending','cleared','failed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider mb-1 block">Notes</label>
            <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              placeholder="Optional" value={form.description} onChange={set('description')} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModal(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg text-sm">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm">
              {saving ? 'Saving…' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Transaction Detail">
        {detail && (
          <div className="space-y-3">
            {[
              ['Merchant', detail.merchant],
              ['Amount', fmt(detail.amount)],
              ['Date', new Date(detail.date).toLocaleString('en-IN')],
              ['Account', accName(detail.account)],
              ['Category', detail.category],
              ['Method', detail.method],
              ['Status', detail.status],
              ['Reference', detail.reference],
              detail.description && ['Notes', detail.description],
            ].filter(Boolean).map(([k,v]) => (
              <div key={k} className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-xs text-slate-500 uppercase tracking-wider">{k}</span>
                <span className="text-sm font-medium text-white font-mono">{v}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-3">
              <button onClick={() => setDetail(null)} className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-lg text-sm">Close</button>
              <button onClick={() => toggleFlag(detail).then(() => setDetail(null))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${detail.flagged ? 'bg-slate-700 text-slate-300' : 'bg-amber-600/20 text-amber-400'}`}>
                {detail.flagged ? 'Remove Flag' : 'Flag'}
              </button>
              <button onClick={() => remove(detail)}
                className="flex-1 bg-red-600/20 text-red-400 py-2.5 rounded-lg text-sm font-semibold">Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
