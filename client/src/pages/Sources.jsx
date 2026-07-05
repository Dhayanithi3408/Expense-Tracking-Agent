import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { Share2, CheckCircle } from 'lucide-react'

const sources = [
  { icon:'📱', name:'Telegram bot', meta:'Manual entries · natural language', status:'live', text:'Live · last event 2m ago' },
  { icon:'🏦', name:'SBI Savings ••2291', meta:'Bank feed, direct API', status:'live', text:'Live · last sync 14m ago' },
  { icon:'💳', name:'HDFC Visa ••4471', meta:'Card feed', status:'syncing', text:'Syncing now' },
  { icon:'📧', name:'Gmail receipts', meta:'Parsed from inbox forwards', status:'paused', text:'Paused by you' },
  { icon:'🏦', name:'ICICI Savings', meta:'Not connected', status:'paused', text:'Available to connect' },
]

export default function Sources() {
  const { t } = useOutletContext()
  return (
    <div className="p-8 pb-12">
      <div className="mb-6">
        <div className="text-[11px] uppercase tracking-widest text-amber font-semibold mb-1">Extended Vision · Feature 01</div>
        <h1 className="font-display text-2xl font-semibold text-paper">{t.sources}</h1>
      </div>

      <div className="grid grid-cols-5 gap-0 card mb-6 overflow-hidden">
        {[['1,204','Raw ingested','4 sources'],['1,158','Parsed','46 unparseable → queued'],
          ['1,091','Deduplicated','67 duplicates merged'],['1,091','Normalized','3 currencies → INR'],
          ['1,091','Logged to ledger','100% written']
        ].map(([n,l,note],i) => (
          <div key={i} className={`p-4 ${i>0?'border-l border-ink/10':''}`}>
            <div className="font-mono text-xl font-semibold text-ink">{n}</div>
            <div className="text-[10px] uppercase tracking-wider text-ink-soft mt-1">{l}</div>
            <div className="text-[11px] text-verde-deep mt-1.5">{note}</div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-base font-semibold text-paper mb-3">Connected Sources</h2>
      <div className="card space-y-0">
        {sources.map((s,i) => (
          <div key={i} className="flex items-center gap-3 py-3.5 border-b border-ink/8 last:border-0">
            <div className="w-9 h-9 rounded-lg bg-paper-dim flex items-center justify-center text-lg">{s.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-ink">{s.name}</div>
              <div className="text-xs text-ink-soft">{s.meta}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${s.status==='live'?'bg-verde':s.status==='syncing'?'bg-amber':'bg-pencil'}`}/>
              <span className="text-xs text-ink-soft">{s.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
