import React, { useState, useRef, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Send, Bot, User } from 'lucide-react'

const SEED = [
  { role:'agent', text:"Hi! I'm your ExpenseAI assistant. Ask me anything about your spending — I read the same ledger I keep in Google Sheets." },
  { role:'user',  text:"How much did I spend on food delivery this week vs last?" },
  { role:'agent', text:"You spent <b>Rs 5,100</b> on food delivery this week, down 18% from last week's Rs 6,240. That's back under your weekly target." },
]

const REPLIES = {
  'how much did i spend on subscriptions this month?': "You've spent <b>Rs 1,498</b> on subscriptions this month across 3 services. Netflix renewed twice in 48 hours — I flagged that as a possible duplicate.",
  'any unusual charges recently?': "Yes, 2 stand out: a <b>Rs 17,700</b> charge from an unrecognized merchant, and Netflix billed twice within 48 hours. Want me to draft a dispute note for either?",
  'forecast my spend for august': "Based on the last 6 months, I'm projecting <b>Rs 2,47,000</b> for August — about 4% above July, mostly driven by rent and a rebound in dining out.",
  'what is my total balance?': "Your total balance across all active accounts is <b>Rs 1,83,800</b>. SBI Savings leads with Rs 48,200.",
}

const CHIPS = [
  'How much did I spend on subscriptions this month?',
  'Any unusual charges recently?',
  'Forecast my spend for August',
  'What is my total balance?',
]

export default function Chat() {
  const { t, user } = useOutletContext()
  const [msgs, setMsgs] = useState(SEED)
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [msgs])

  const send = (text) => {
    const q = text || input.trim()
    if (!q) return
    setInput('')
    setMsgs(m => [...m, { role:'user', text: q }])
    setTimeout(() => {
      const key = q.toLowerCase()
      const reply = REPLIES[key] || "Here's what I found in the ledger — spending looks steady. No new anomalies since we last spoke."
      setMsgs(m => [...m, { role:'agent', text: reply }])
    }, 600)
  }

  return (
    <div className="p-8 pb-12 h-screen flex flex-col">
      <div className="mb-5 shrink-0">
        <div className="text-[11px] uppercase tracking-widest text-amber font-semibold mb-1">Natural Language</div>
        <h1 className="font-display text-2xl font-semibold text-paper">{t.chat}</h1>
      </div>

      <div className="flex-1 max-w-3xl w-full flex flex-col min-h-0">
        <div className="card flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
            {msgs.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'agent' && (
                  <div className="w-7 h-7 rounded-full bg-verde flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[74%] px-4 py-2.5 rounded-xl text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'bg-verde text-paper rounded-br-sm'
                    : 'bg-paper-dim text-ink rounded-bl-sm'}`}
                  dangerouslySetInnerHTML={{ __html: m.text }}
                />
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-wire-soft flex items-center justify-center shrink-0 mt-0.5">
                    <User size={13} className="text-pencil-navy" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chips */}
          <div className="flex gap-2 flex-wrap mb-3 shrink-0">
            {CHIPS.map(c => (
              <button key={c} onClick={() => send(c)}
                className="text-xs px-3 py-1.5 rounded-full border border-ink/15 text-ink-soft hover:border-verde hover:text-verde-deep transition-colors bg-transparent">
                {c}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-ink/10 pt-3 shrink-0">
            <input
              className="input flex-1"
              placeholder="Ask about your spending…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button onClick={() => send()} className="btn btn-primary px-4">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
