import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { Wallet, TrendingUp, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats]   = useState(null)
  const [txns, setTxns]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/stats'), api.get('/transactions?limit=5')])
      .then(([s, t]) => { setStats(s.data); setTxns(t.data.slice(0,6)) })
      .finally(() => setLoading(false))
  }, [])

  const fmt = n => `₹${Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`
  const greet = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-emerald-500 uppercase tracking-widest font-semibold mb-1">
          This month · {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
        </p>
        <h1 className="text-2xl font-bold text-white">
          {greet()}, {user?.firstName} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here is your financial overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wallet}        label="Total Balance"     value={stats ? fmt(stats.totalBalance)  : '—'} color="bg-emerald-600" sub={`${stats?.activeAccounts || 0} active accounts`} />
        <StatCard icon={TrendingUp}    label="Month Spend"       value={stats ? fmt(stats.monthlySpend)  : '—'} color="bg-amber-600"   sub="Debit transactions" />
        <StatCard icon={ArrowDownLeft} label="Month Income"      value={stats ? fmt(stats.monthlyIncome) : '—'} color="bg-blue-600"    sub="Credit transactions" />
        <StatCard icon={AlertTriangle} label="Flagged Items"     value={stats?.flaggedTxns ?? '—'}               color="bg-red-600"     sub={`${stats?.pendingTxns || 0} pending`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Monthly Spend</h2>
              <p className="text-xs text-slate-500">Last 6 months</p>
            </div>
          </div>
          {stats?.volumeData?.length ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.volumeData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                  formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Spend']}
                />
                <Bar dataKey="spend" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-600 text-sm">
              No transaction data yet
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Transactions</h2>
          {txns.length === 0 ? (
            <div className="text-slate-500 text-sm text-center py-8">No transactions yet</div>
          ) : (
            <div className="space-y-3">
              {txns.map(t => (
                <div key={t._id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                    ${t.amount > 0 ? 'bg-emerald-600/20' : 'bg-red-600/20'}`}>
                    {t.amount > 0
                      ? <ArrowDownLeft size={14} className="text-emerald-400" />
                      : <ArrowUpRight  size={14} className="text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{t.merchant}</p>
                    <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`text-sm font-semibold font-mono ${t.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.amount > 0 ? '+' : ''}{fmt(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
