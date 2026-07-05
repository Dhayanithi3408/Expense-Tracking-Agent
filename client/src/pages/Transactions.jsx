import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'
import toast from 'react-hot-toast'
import { Plus, X, Flag, Trash2, BarChart2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const CATS = ['Uncategorized','Shopping','Food & Drink','Transport','Subscriptions','Housing','Health','Income','Transfer']
const METHODS = ['Online','Card','Bank Transfer','UPI','NEFT','IMPS']
const ICON_MAP = {'Shopping':'🛍️','Food & Drink':'🍽️','Transport':'🚗','Subscriptions':'📱','Housing':'🏠','Health':'💊','Income':'💰','Transfer':'🔄','Uncategorized':'🏦'}

function Modal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-navy-deep/70 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-paper rounded-lg shadow-lift w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

export default function Transactions() {
  const { t } = useOutletContext()
  const [txns,     setTxns]     = useState([])
  const [accounts, setAccounts] = useState([])
  const [stats,    setStats]    = useState({})
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [detail,   setDetail]   = useState(null)
  const [filters,  setFilters]  = useState({ accountId:'', status:'', category:'' })
  const [form,     setForm]     = useState({ accountId:'', merchant:'', category:'Uncategorized', amount:'', method:'Online', status:'pending', description:'' })
  const [saving,   setSaving]   = useState(false)

  const load = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.accountId) params.set('accountId', filters.accountId)
      if (filters.status)    params.set('status',    filters.status)
      if (filters.category)  params.set('category',  filters.category)
      const [tx, ac, st] = await Promise.all([
        api.get('/transactions?' + params),
        api.get('/accounts'),
        api.get('/transactions/stats'),
      ])
      setTxns(tx.data); setAccounts(ac.data); setStats(st.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [filters])

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/transactions', form)
      toast.success('Transaction saved!')
      setModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const flag = async (id, flagged) => {
    try { await api.patch(`/transactions/${id}`, { flagged }); load() }
    catch { toast.error('Failed') }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this transaction?')) return
    try { await api.delete(`/transactions/${id}`); setDetail(null); toast.success('Deleted'); load() }
    catch { toast.error('Failed') }
  }

  const chartData = (stats.monthlyVolume||[]).map((v,i)=>({
    month: ['Feb','Mar','Apr','May','Jun','Jul'][i],
    spend: Math.round(v)
  }))

  return (
    <div className="p-8 pb-12">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-amber font-semibold mb-1">Payment Tracking</div>
          <h1 className="font-display text-2xl font-semibold text-paper">{t.online_txn}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select className="pill cursor-pointer" value={filters.accountId} onChange={e=>setFilters(p=>({...p,accountId:e.target.value}))}>
            <option value="">All accounts</option>
            {accounts.map(a=><option key={a._id} value={a._id}>{a.bankName} {a.accountNumber}</option>)}
          </select>
          <select className="pill cursor-pointer" value={filters.status} onChange={e=>setFilters(p=>({...p,status:e.target.value}))}>
            <option value="">All statuses</option>
            {['cleared','pending','failed'].map(s=><option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <button onClick={()=>setModal(true)} className="btn btn-primary"><Plus size={14}/>Add Transaction</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="card"><div className="stat-label">Month Spend</div><div className="stat-value">Rs {(stats.thisMonthSpend||0).toLocaleString('en-IN',{minimumFractionDigits:0})}</div><div className="stat-delta text-amber">Jul 2026</div></div>
        <div className="card"><div className="stat-label">Month Income</div><div className="stat-value text-verde-deep">+Rs {(stats.thisMonthIncome||0).toLocaleString('en-IN',{minimumFractionDigits:0})}</div><div className="stat-delta">received</div></div>
        <div className="card"><div className="stat-label">Failed</div><div className="stat-value text-danger">{stats.failedTxns||0}</div><div className="stat-delta">this month</div></div>
        <div className="card"><div className="stat-label">Flagged</div><div className="stat-value text-amber">{stats.flaggedTxns||0}</div><div className="stat-delta">suspicious</div></div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="card mb-5">
          <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4 flex items-center gap-2">
            <BarChart2 size={12}/>Monthly Spend Volume (last 6 months)
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,36,33,0.08)"/>
              <XAxis dataKey="month" tick={{fontSize:11, fontFamily:'IBM Plex Mono', fill:'#4A5350'}}/>
              <YAxis tick={{fontSize:11, fontFamily:'IBM Plex Mono', fill:'#4A5350'}} tickFormatter={v=>`Rs ${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={(v)=>`Rs ${v.toLocaleString('en-IN')}`} contentStyle={{background:'#F6F1E4',border:'none',borderRadius:6,fontSize:12}}/>
              <Bar dataKey="spend" fill="#3C7A6A" radius={[4,4,0,0]} maxBarSize={32}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Ledger */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-paper">Transaction Ledger</h2>
        <span className="text-xs text-pencil-navy">{txns.length} transaction{txns.length!==1?'s':''}</span>
      </div>
      <div className="card">
        {loading ? (
          <div className="py-12 text-center text-ink-soft text-sm">Loading…</div>
        ) : txns.length === 0 ? (
          <div className="py-12 text-center text-ink-soft text-sm">No transactions found.</div>
        ) : txns.map(tx => {
          const acc = tx.account
          const pos = tx.amount > 0
          return (
            <div key={tx._id} className="ledger-row cursor-pointer hover:bg-ink/3 rounded-md px-2 -mx-2 transition-colors"
              onClick={()=>setDetail(tx)}>
              <div className="text-xl w-9 text-center">{ICON_MAP[tx.category]||'🏦'}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-ink flex items-center gap-2">
                  {tx.merchant}
                  {tx.flagged && <span className="badge badge-amber text-[10px]">Flagged</span>}
                </div>
                <div className="text-[11.5px] text-ink-soft mt-0.5">
                  {new Date(tx.date).toLocaleDateString('en-IN',{day:'2-digit',month:'short'})}
                  {acc ? ` · ${acc.bankName} ${acc.accountNumber}` : ''} · {tx.method}
                </div>
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  <span className="badge badge-green">{tx.category}</span>
                  <span className={`badge ${tx.status==='cleared'?'badge-green':tx.status==='failed'?'badge-red':'badge-amber'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`font-mono text-sm font-semibold ${pos?'text-verde-deep':'text-ink'}`}>
                  {pos?'+':'-'}Rs {Math.abs(tx.amount).toLocaleString('en-IN',{minimumFractionDigits:2})}
                </div>
                <button onClick={e=>{e.stopPropagation();flag(tx._id,!tx.flagged)}}
                  className={`p-1.5 rounded transition-colors ${tx.flagged?'text-amber hover:text-amber/70':'text-pencil-navy hover:text-amber'}`}>
                  <Flag size={13}/>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Transaction Modal */}
      <Modal open={modal} onClose={()=>setModal(false)}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">Add Transaction</h2>
          <button onClick={()=>setModal(false)} className="text-ink-soft hover:text-ink"><X size={18}/></button>
        </div>
        <form onSubmit={submit} className="space-y-3.5">
          <div>
            <label className="label">Account *</label>
            <select className="input" value={form.accountId} onChange={e=>setForm(p=>({...p,accountId:e.target.value}))} required>
              <option value="">Select account</option>
              {accounts.map(a=><option key={a._id} value={a._id}>{a.bankName} {a.accountNumber}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Merchant / Description *</label>
            <input className="input" placeholder="e.g. Amazon, Netflix" value={form.merchant}
              onChange={e=>setForm(p=>({...p,merchant:e.target.value}))} required/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Amount * <span className="normal-case text-ink-soft/70">(use – for debit)</span></label>
              <input className="input" type="number" step="0.01" placeholder="-499.00" value={form.amount}
                onChange={e=>setForm(p=>({...p,amount:e.target.value}))} required/>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Method</label>
              <select className="input" value={form.method} onChange={e=>setForm(p=>({...p,method:e.target.value}))}>
                {METHODS.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                {['pending','cleared','failed'].map(s=><option key={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input className="input" placeholder="Optional details" value={form.description}
              onChange={e=>setForm(p=>({...p,description:e.target.value}))}/>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={()=>setModal(false)} className="btn">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">{saving?'Saving…':'Save Transaction'}</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={()=>setDetail(null)}>
        {detail && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-semibold text-ink">Transaction Detail</h2>
              <button onClick={()=>setDetail(null)} className="text-ink-soft hover:text-ink"><X size={18}/></button>
            </div>
            {[
              ['Merchant',  detail.merchant],
              ['Amount',    `${detail.amount>0?'+':'-'}Rs ${Math.abs(detail.amount).toLocaleString('en-IN',{minimumFractionDigits:2})}`],
              ['Date',      new Date(detail.date).toLocaleString('en-IN')],
              ['Category',  detail.category],
              ['Method',    detail.method],
              ['Status',    detail.status],
              ['Reference', detail.reference],
              ...(detail.description ? [['Notes', detail.description]] : []),
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-ink/8 last:border-0 text-sm">
                <span className="text-xs uppercase tracking-wider text-ink-soft font-medium">{k}</span>
                <span className="font-mono text-ink font-medium">{v}</span>
              </div>
            ))}
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={()=>setDetail(null)} className="btn">Close</button>
              <button onClick={()=>{flag(detail._id,!detail.flagged);setDetail(null)}} className={`btn ${detail.flagged?'':'btn-danger'}`}>
                <Flag size={13}/>{detail.flagged ? 'Remove Flag' : 'Flag'}
              </button>
              <button onClick={()=>del(detail._id)} className="btn btn-danger">
                <Trash2 size={13}/>Delete
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
