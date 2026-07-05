// ==========================================================================
// ExpenseAI — app logic (mock data, no backend). Same shell drives every screen.
// ==========================================================================

function iconFor(kind) {
  const icons = {
    food: '<path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M18 3c-2 2-2 5-2 7 0 1.5 1 2 2 2s2-.5 2-2c0-2 0-5-2-7Zm0 9v9"/>',
    transport: '<path d="M5 17h14M6 17v2M18 17v2M5 11l1.5-5h11L19 11M4 11h16v6H4z"/>',
    shopping: '<path d="M6 2 3 6v14a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V6l-3-4M3 6h18M9 10a3 3 0 0 0 6 0"/>',
    subscription: '<path d="M17 2v4M7 2v4M3 9h18M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
    home: '<path d="m3 11 9-7 9 7M5 10v10h14V10"/>',
    health: '<path d="M12 21s-7-4.5-9.5-9C.5 8 2 4 6 4c2 0 3.5 1.2 4 2 0 0 .5 1 2 1s2-1 2-1c.5-.8 2-2 4-2 4 0 5.5 4 3.5 8-2.5 4.5-9.5 9-9.5 9Z"/>',
    income: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    telegram: '<path d="m22 2-7 20-4-9-9-4Z"/>',
    bank: '<path d="M3 21h18M4 10h16M12 3 3 8h18ZM6 10v8M12 10v8M18 10v8"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    mail: '<path d="M4 4h16v16H4Z"/><path d="m4 6 8 7 8-7"/>',
  };
  return icons[kind] || icons.shopping;
}

function svgIcon(kind) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${iconFor(kind)}</svg>`;
}

// ---------------- data ----------------

const overviewActivity = [
  { icon: 'food', title: 'Chai Point', sub: 'Today, 8:14 AM · via Telegram', amount: '-Rs 120', tag: 'Food & Drink' },
  { icon: 'subscription', title: 'Hotstar Premium', sub: 'Today, 6:00 AM · Card ••4471', amount: '-Rs 299', tag: 'Subscriptions' },
  { icon: 'income', title: 'Freelance payment', sub: 'Yesterday · Bank feed', amount: '+Rs 37,500', tag: 'Income' },
  { icon: 'transport', title: 'Ola Cab', sub: 'Yesterday, 9:42 PM · via Telegram', amount: '-Rs 185', tag: 'Transport' },
  { icon: 'shopping', title: 'Myntra', sub: '2 days ago · Card ••4471', amount: '-Rs 1,299', tag: 'Shopping' },
];

const txLedger = [
  { icon: 'card', iconTone: 'amber', title: 'Cult.fit Membership', sub: 'Jul 3 · Card ••4471', amount: '-Rs 1,499',
    category: 'Fitness', confidence: 94, tone: 'ok', anomaly: 'Subscription creep · +18% vs last 3mo', anomalyTone: 'anomaly' },
  { icon: 'shopping', iconTone: 'amber', title: 'Unknown Merchant #4127', sub: 'Jul 2 · Card ••4471', amount: '-Rs 17,700',
    category: 'Uncategorized', confidence: 41, tone: 'risk', anomaly: 'New merchant · above 90th percentile', anomalyTone: 'risk' },
  { icon: 'food', title: 'Swiggy', sub: 'Jul 2 · via Telegram', amount: '-Rs 485',
    category: 'Food & Drink', confidence: 97, tone: 'ok', anomaly: null },
  { icon: 'card', iconTone: 'amber', title: 'Netflix India', sub: 'Jul 1 · Card ••4471', amount: '-Rs 649',
    category: 'Subscriptions', confidence: 88, tone: 'ok', anomaly: 'Duplicate suspected · charged twice in 48h', anomalyTone: 'anomaly' },
  { icon: 'transport', title: 'BPCL Petrol Pump', sub: 'Jun 30 · Bank feed', amount: '-Rs 3,200',
    category: 'Transport', confidence: 99, tone: 'ok', anomaly: null },
  { icon: 'home', title: 'Rent — July', sub: 'Jun 29 · Bank feed', amount: '-Rs 22,000',
    category: 'Housing', confidence: 100, tone: 'ok', anomaly: null },
  { icon: 'health', title: 'Apollo Pharmacy', sub: 'Jun 28 · Card ••4471', amount: '-Rs 860',
    category: 'Health', confidence: 92, tone: 'ok', anomaly: null },
];

const sources = [
  { icon: 'telegram', name: 'Telegram bot', meta: 'Manual entries · natural language', status: 'live', text: 'Live · last event 2m ago' },
  { icon: 'bank', name: 'Chase checking ••2291', meta: 'Bank feed, direct API', status: 'live', text: 'Live · last sync 14m ago' },
  { icon: 'card', name: 'Visa ••4471', meta: 'Card feed', status: 'syncing', text: 'Syncing now' },
  { icon: 'mail', name: 'Gmail receipts', meta: 'Parsed from inbox forwards', status: 'paused', text: 'Paused by you' },
  { icon: 'bank', name: 'Ally savings', meta: 'Not connected', status: 'paused', text: 'Available to connect' },
];

const integrations = [
  { icon: 'telegram', name: 'Telegram', meta: '@expenseai_bot connected', on: true },
  { icon: 'shopping', name: 'Google Sheets', meta: 'Writing to "2026 Ledger"', on: true },
  { icon: 'bank', name: 'OpenAI', meta: 'gpt-4.1 · categorization + chat', on: true },
  { icon: 'card', name: 'Plaid (bank/card feeds)', meta: '2 accounts connected', on: true },
];

const auditLog = [
  { time: '10:42', text: 'Agent asked for confirmation before logging <b>$212.50</b> to Uncategorized — awaiting reply.' },
  { time: '09:15', text: 'Agent flagged <b>StreamPlus</b> as a possible duplicate charge.' },
  { time: '08:14', text: 'Logged <b>-$6.40</b> at Blue Bottle Coffee from Telegram message.' },
  { time: 'Yest.', text: 'New category <b>"Pet care"</b> created after confirmation.' },
  { time: 'Yest.', text: 'Gmail receipts source paused by user.' },
];

const recurring = [
  { icon: 'subscription', title: 'Hotstar Premium', sub: 'Monthly · next Aug 5', amount: '-Rs 299' },
  { icon: 'subscription', title: 'Netflix India', sub: 'Monthly · next Aug 1', amount: '-Rs 649' },
  { icon: 'home', title: 'Rent', sub: 'Monthly · next Aug 1', amount: '-Rs 22,000' },
  { icon: 'card', title: 'Cult.fit Membership', sub: 'Monthly · next Aug 3', amount: '-Rs 1,499' },
];

// ---------------- render helpers ----------------

function renderOverviewLedger() {
  const el = document.getElementById('overview-ledger');
  el.innerHTML = overviewActivity.map(r => `
    <div class="ledger-row">
      <div class="ledger-icon">${svgIcon(r.icon)}</div>
      <div class="ledger-main">
        <div class="ledger-title">${r.title}</div>
        <div class="ledger-sub">${r.sub}</div>
      </div>
      <div class="ledger-amount ${r.amount.startsWith('+') ? 'pos' : 'neg'}">${r.amount}</div>
    </div>
  `).join('');
}

function renderTxLedger() {
  const el = document.getElementById('tx-ledger');
  el.innerHTML = txLedger.map(r => `
    <div class="ledger-row">
      <div class="stamp sm ${r.tone}">
        <span class="stamp-pct">${r.confidence}%</span>
        <span class="stamp-txt">sure</span>
      </div>
      <div class="ledger-main">
        <div class="ledger-title">${r.title}</div>
        <div class="ledger-sub">${r.sub}</div>
        <div class="ledger-tags">
          <span class="tag category">${r.category}</span>
          ${r.anomaly ? `<span class="tag ${r.anomalyTone}">⚑ ${r.anomaly}</span>` : ''}
        </div>
      </div>
      <div class="ledger-amount neg">${r.amount}</div>
    </div>
  `).join('');
}

function renderSources() {
  const el = document.getElementById('sources-list');
  el.innerHTML = sources.map(s => `
    <div class="source-row">
      <div class="source-badge">${svgIcon(s.icon)}</div>
      <div>
        <div class="source-name">${s.name}</div>
        <div class="source-meta">${s.meta}</div>
      </div>
      <div class="source-status">
        <span class="dot ${s.status}"></span>
        <span class="status-text">${s.text}</span>
      </div>
    </div>
  `).join('');
}

function renderIntegrations() {
  const el = document.getElementById('integrations-list');
  el.innerHTML = integrations.map(i => `
    <div class="integration-row">
      <div class="source-badge">${svgIcon(i.icon)}</div>
      <div>
        <div class="ledger-title">${i.name}</div>
        <div class="ledger-sub">${i.meta}</div>
      </div>
      <div class="switch ${i.on ? 'on' : ''}" style="margin-left:auto;" onclick="this.classList.toggle('on')"></div>
    </div>
  `).join('');
}

function renderAudit() {
  const el = document.getElementById('audit-list');
  el.innerHTML = auditLog.map(a => `
    <div class="audit-row">
      <div class="audit-time">${a.time}</div>
      <div class="audit-text">${a.text}</div>
    </div>
  `).join('');
}

function renderRecurring() {
  const el = document.getElementById('recurring-ledger');
  el.innerHTML = recurring.map(r => `
    <div class="ledger-row">
      <div class="ledger-icon">${svgIcon(r.icon)}</div>
      <div class="ledger-main">
        <div class="ledger-title">${r.title}</div>
        <div class="ledger-sub">${r.sub}</div>
      </div>
      <div class="ledger-amount neg">${r.amount}</div>
    </div>
  `).join('');
}

// ---------------- navigation ----------------

function goTo(screen) {
  document.querySelectorAll('.screen[id^="screen-"]').forEach(s => s.hidden = (s.id !== `screen-${screen}`));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.screen === screen));
  window.scrollTo({ top: 0 });
}

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => goTo(btn.dataset.screen));
});

// ---------------- chat ----------------

const chatSeed = [
  { role: 'agent', text: "Hi! I'm your expense agent. Ask me anything about your spending — I'm reading the same ledger I keep in Google Sheets." },
  { role: 'user', text: "how much did i spend on food delivery this week vs last?" },
  { role: 'agent', text: "You spent <b>$61.20</b> on food delivery this week, down 18% from last week's $74.80 — back under your weekly target." },
  { role: 'user', text: "nice. log $14 for lunch at Choi's" },
  { role: 'agent', text: "Logged <b>-$14.00</b> · Choi's · Food &amp; Drink to the sheet." },
];

const chatReplies = {
  'how much did i spend on subscriptions this month?': "You've spent <b>$41.98</b> on subscriptions this month across 3 services. StreamPlus renewed twice in 48 hours — I flagged that as a possible duplicate.",
  'any unusual charges recently?': "Yes, 2 stand out: a <b>$212.50</b> charge from a merchant I don't recognize, and <b>StreamPlus</b> billed twice within 48 hours. Want me to draft a dispute note for either?",
  'forecast my spend for august': "Based on the last 6 months, I'm projecting <b>$2,960</b> for August — about 4% above July, mostly driven by rent and a rebound in dining out."
};

function pushMsg(role, html, stampHtml) {
  const scroll = document.getElementById('chat-scroll');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = html + (stampHtml || '');
  scroll.appendChild(div);
  scroll.scrollTop = scroll.scrollHeight;
}

function renderChatSeed() {
  const scroll = document.getElementById('chat-scroll');
  scroll.innerHTML = '';
  chatSeed.forEach(m => pushMsg(m.role, m.text));
}

function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;
  pushMsg('user', text);
  input.value = '';
  setTimeout(() => {
    const key = text.toLowerCase();
    const reply = chatReplies[key] || "Here's what I found in the ledger — spending looks steady, no new anomalies since we last spoke.";
    pushMsg('agent', reply, `<div class="msg-stamp-line"><span class="stamp sm ok" style="width:30px;height:30px;"><span class="stamp-pct" style="font-size:8.5px;">98%</span></span><span style="font-size:11px;color:var(--ink-soft)">from live ledger</span></div>`);
  }, 500);
}

function askSample(text) {
  goTo('chat');
  const input = document.getElementById('chat-input');
  input.value = text;
  sendChat();
}

document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChat();
});

// ---------------- charts ----------------

function renderCharts() {
  const forecastCtx = document.getElementById('forecastChart');
  new Chart(forecastCtx, {
    type: 'line',
    data: {
      labels: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
      datasets: [
        {
          label: 'Actual',
          data: [2410, 2530, 2380, 2670, 2540, 2847, null],
          borderColor: '#3C7A6A',
          backgroundColor: 'rgba(60,122,106,0.12)',
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: 'Forecast',
          data: [null, null, null, null, null, 2847, 2960],
          borderColor: '#C97A2B',
          borderDash: [5, 4],
          backgroundColor: 'transparent',
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#4A5350', font: { family: 'IBM Plex Mono', size: 11 } } },
        y: { grid: { color: 'rgba(26,36,33,0.08)' }, ticks: { color: '#4A5350', font: { family: 'IBM Plex Mono', size: 11 } } },
      },
    },
  });

  const categoryCtx = document.getElementById('categoryChart');
  new Chart(categoryCtx, {
    type: 'bar',
    data: {
      labels: ['Housing', 'Food', 'Transport', 'Subs', 'Shopping', 'Health'],
      datasets: [{
        data: [1450, 410, 180, 42, 220, 90],
        backgroundColor: '#3C7A6A',
        borderRadius: 4,
        maxBarThickness: 26,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#4A5350', font: { family: 'IBM Plex Mono', size: 10.5 } } },
        y: { grid: { color: 'rgba(26,36,33,0.08)' }, ticks: { color: '#4A5350', font: { family: 'IBM Plex Mono', size: 11 } } },
      },
    },
  });
}

// ---------------- init ----------------

renderOverviewLedger();
renderTxLedger();
renderSources();
renderIntegrations();
renderAudit();
renderRecurring();
renderChatSeed();
renderCharts();
