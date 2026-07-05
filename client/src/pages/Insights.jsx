import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import api from '../api'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const MONTHS = ['Feb','Mar','Apr','May','Jun','Jul']

export default function Insights() {
  const { t } = useOutletContext()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/transactions/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  const volumeData = (stats?.monthlyVolume || []).map((v,i) => ({ month: MONTHS[i], spend: Math.round(v) }))
  const forecastData = [...volumeData, { month:'Aug', forecast: Math.round((stats?.thisMonthSpend||0) * 1.04) }]

  return (
    <div className="p-8 pb-12">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-widest text-amber font-semibold mb-1">Analytics</div>
        <h1 className="font-display text-2xl font-semibold text-paper">{t.insights}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card">
          <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">Spend vs Forecast (6 months)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,36,33,0.08)"/>
              <XAxis dataKey="month" tick={{fontSize:11,fontFamily:'IBM Plex Mono',fill:'#4A5350'}}/>
              <YAxis tick={{fontSize:11,fontFamily:'IBM Plex Mono',fill:'#4A5350'}} tickFormatter={v=>`Rs ${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>`Rs ${v?.toLocaleString('en-IN')}`} contentStyle={{background:'#F6F1E4',border:'none',borderRadius:6,fontSize:12}}/>
              <Legend wrapperStyle={{fontSize:11,fontFamily:'IBM Plex Mono'}}/>
              <Line type="monotone" dataKey="spend" stroke="#3C7A6A" strokeWidth={2} dot={{r:3}} name="Actual"/>
              <Line type="monotone" dataKey="forecast" stroke="#C97A2B" strokeWidth={2} strokeDasharray="5 4" dot={{r:3}} name="Forecast"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-4">By Category</div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[
              {cat:'Housing',amt:22000},{cat:'Food',amt:8500},{cat:'Transport',amt:3200},
              {cat:'Subs',amt:1500},{cat:'Shopping',amt:5000},{cat:'Health',amt:2000}
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,36,33,0.08)"/>
              <XAxis dataKey="cat" tick={{fontSize:10,fontFamily:'IBM Plex Mono',fill:'#4A5350'}}/>
              <YAxis tick={{fontSize:10,fontFamily:'IBM Plex Mono',fill:'#4A5350'}} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip formatter={v=>`Rs ${v?.toLocaleString('en-IN')}`} contentStyle={{background:'#F6F1E4',border:'none',borderRadius:6,fontSize:12}}/>
              <Bar dataKey="amt" fill="#3C7A6A" radius={[4,4,0,0]} maxBarSize={28}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="card">
          <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-3">Budget Recommendations</div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2 text-sm"><span className="text-amber mt-0.5">•</span><span className="text-ink">Trim dining out by <strong>Rs 800/mo</strong> — exceeded 3 of last 4 months</span></div>
            <div className="flex items-start gap-2 text-sm"><span className="text-amber mt-0.5">•</span><span className="text-ink">Cancel 1 unused subscription — unused 47 days, Rs 149/mo</span></div>
            <div className="flex items-start gap-2 text-sm"><span className="text-verde-deep mt-0.5">✓</span><span className="text-ink">Transport spend is within budget this month</span></div>
          </div>
        </div>
        <div className="card">
          <div className="text-[10.5px] uppercase tracking-wider text-ink-soft mb-3">Recurring Bills Detected</div>
          {[
            {name:'Hotstar Premium',due:'Monthly · next Aug 5',amt:'Rs 299'},
            {name:'Netflix India',due:'Monthly · next Aug 1',amt:'Rs 649'},
            {name:'Rent',due:'Monthly · next Aug 1',amt:'Rs 22,000'},
            {name:'Cult.fit',due:'Monthly · next Aug 3',amt:'Rs 1,499'},
          ].map((r,i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-ink/8 last:border-0 text-sm">
              <div><div className="font-medium text-ink">{r.name}</div><div className="text-xs text-ink-soft">{r.due}</div></div>
              <div className="font-mono text-danger font-medium">-{r.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
