import React from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { RefreshCw, Plus, TrendingUp, AlertTriangle, CheckCircle, Wallet } from 'lucide-react'

const activity = [
  { icon:'🍵', title:'Chai Point', sub:'Today, 8:14 AM · via Telegram', amount:'-Rs 120', pos:false, tag:'Food & Drink' },
  { icon:'📺', title:'Hotstar Premium', sub:'Today, 6:00 AM · Card ••4471', amount:'-Rs 299', pos:false, tag:'Subscriptions' },
  { icon:'💰', title:'Freelance Payment', sub:'Yesterday · Bank feed', amount:'+Rs 37,500', pos:true, tag:'Income' },
  { icon:'🚗', title:'Ola Cab', sub:'Yesterday, 9:42 PM · via Telegram', amount:'-Rs 185', pos:false, tag:'Transport' },
  { icon:'🛍️', title:'Myntra', sub:'2 days ago · Card ••4471', amount:'-Rs 1,299', pos:false, tag:'Shopping' },
]

export default function Overview() {
  const { t, user } = useOutletContext()
  const firstName = user?.firstName || 'User'

  return (
    <div className="p-8 pb-12">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-amber font-semibold mb-1">{t.this_month}</div>
          <h1 className="font-display text-2xl font-semibold text-paper">
            {t.greeting(firstName)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="pill"><RefreshCw size={11}/>{t.synced}</span>
          <button className="btn btn-primary"><Plus size={14}/>{t.log_expense}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-5">
        <div className="card">
          <div className="stat-label">Spent this month</div>
          <div className="stat-value">Rs 2,37,250</div>
          <div className="stat-delta text-danger flex items-center gap-1"><TrendingUp size={11}/> 12% vs June</div>
        </div>
        <div className="card">
          <div className="stat-label">Budget remaining</div>
          <div className="stat-value">Rs 62,750</div>
          <div className="mt-2.5 h-1.5 rounded-full bg-ink/10 overflow-hidden">
            <div className="h-full rounded-full bg-verde w-[81%]"/>
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Flagged anomalies</div>
          <div className="stat-value text-amber">3</div>
          <div className="stat-delta flex items-center gap-1"><AlertTriangle size={11}/> 2 need review</div>
        </div>
        <div className="card">
          <div className="stat-label">Auto-categorized</div>
          <div className="stat-value">96%</div>
          <div className="stat-delta text-verde-deep flex items-center gap-1"><CheckCircle size={11}/> +4pt this month</div>
        </div>
      </div>

      {/* Activity + Chat preview */}
      <div className="grid grid-cols-[1.6fr_1fr] gap-3.5">
        <div className="card">
          <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-3">Recent ledger activity</div>
          <div>
            {activity.map((r,i) => (
              <div key={i} className="ledger-row">
                <div className="text-xl w-9 text-center">{r.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-ink truncate">{r.title}</div>
                  <div className="text-[11.5px] text-ink-soft mt-0.5">{r.sub}</div>
                </div>
                <div className={`font-mono text-sm font-semibold ${r.pos ? 'text-verde-deep' : 'text-ink'}`}>{r.amount}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-navy">
          <div className="text-[10.5px] uppercase tracking-wider text-pencil-navy mb-3">Ask ExpenseAI</div>
          <div className="bg-white/4 border border-wire rounded-lg p-3 mb-3 font-mono text-xs text-paper">
            "How much did I spend on food delivery this week?"
          </div>
          <div className="text-[12.5px] text-pencil-navy leading-relaxed">
            You spent <strong className="text-paper">Rs 5,100</strong> on food delivery this week,
            down <strong className="text-paper">18%</strong> from last week's Rs 6,240.
          </div>
          <Link to="/chat">
            <button className="btn w-full justify-center mt-3 text-xs">Open full chat &rarr;</button>
          </Link>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3.5 mt-5">
        <Link to="/accounts">
          <div className="card hover:shadow-lift transition-shadow cursor-pointer group">
            <Wallet className="text-verde mb-3 group-hover:scale-110 transition-transform" size={22}/>
            <div className="font-medium text-ink text-sm">Bank Accounts</div>
            <div className="text-xs text-ink-soft mt-1">Manage connected accounts</div>
          </div>
        </Link>
        <Link to="/payments">
          <div className="card hover:shadow-lift transition-shadow cursor-pointer group">
            <CheckCircle className="text-amber mb-3 group-hover:scale-110 transition-transform" size={22}/>
            <div className="font-medium text-ink text-sm">Transactions</div>
            <div className="text-xs text-ink-soft mt-1">View all online transactions</div>
          </div>
        </Link>
        <Link to="/insights">
          <div className="card hover:shadow-lift transition-shadow cursor-pointer group">
            <TrendingUp className="text-verde-deep mb-3 group-hover:scale-110 transition-transform" size={22}/>
            <div className="font-medium text-ink text-sm">Insights</div>
            <div className="text-xs text-ink-soft mt-1">Forecast & spending trends</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
