// ==========================================================================
// ExpenseAI - Payment Tracking (Bank Accounts + Online Transactions)
// Indian-first: default currency INR, all amounts stored in base currency
// ==========================================================================

const API = 'http://localhost:3001/api';

// State
let activeCurrency = 'INR';
let fxRates        = { USD:1, INR:83.42, EUR:0.92, GBP:0.79, CAD:1.36, AUD:1.52, JPY:157.80, CHF:0.90, SGD:1.34, AED:3.67 };
let currencySymbols = { USD:'$', INR:'Rs ', EUR:'e', GBP:'p', CAD:'C$', AUD:'A$', JPY:'Y', CHF:'Fr', SGD:'S$', AED:'AED ' };
let allAccounts    = [];
let allTransactions = [];
let paymentChart   = null;

// Currency helpers
function sym() { return currencySymbols[activeCurrency] || (activeCurrency + ' '); }
function rate() { return fxRates[activeCurrency] || 1; }
function convert(usdAmt) { return usdAmt * rate(); }
function decimals() { return activeCurrency === 'JPY' ? 0 : 2; }

function fmt(usdAmt) {
  const c = convert(usdAmt);
  const abs = Math.abs(c).toLocaleString('en-IN', { minimumFractionDigits: decimals(), maximumFractionDigits: decimals() });
  return (usdAmt < 0 ? '-' : '+') + sym() + abs;
}

function fmtBal(usdAmt) {
  const c = convert(usdAmt);
  const abs = Math.abs(c).toLocaleString('en-IN', { minimumFractionDigits: decimals(), maximumFractionDigits: decimals() });
  return (c < 0 ? '-' : '+') + sym() + abs;
}

function fmtStat(usdAmt) {
  const c = convert(usdAmt);
  return sym() + Math.abs(c).toLocaleString('en-IN', { minimumFractionDigits: decimals(), maximumFractionDigits: decimals() });
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) +
    ' - ' + d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
}

function fmtDateShort(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
}

function initials(name) {
  return name.split(' ').map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase();
}

// API wrapper
async function apiFetch(path, opts) {
  opts = opts || {};
  const res = await fetch(API + path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function showError(id, msg) { var el=document.getElementById(id); if(el){el.textContent=msg;el.hidden=false;} }
function hideError(id) { var el=document.getElementById(id); if(el){el.hidden=true;} }
function openModal(id) { document.getElementById(id).hidden=false; document.body.style.overflow='hidden'; }
function closeModal(id) { document.getElementById(id).hidden=true; document.body.style.overflow=''; }
window.closeModal = closeModal;

// Currency change handler (called from settings dropdown + currency pickers)
window.onCurrencyChange = function(val) {
  activeCurrency = val;
  // Sync all currency pickers in the DOM
  document.querySelectorAll('.currency-picker, #set-currency').forEach(function(el){ el.value = val; });
  rerenderAll();
};

function rerenderAll() {
  if (allAccounts.length)     renderAccountsList(allAccounts);
  if (allTransactions.length) renderTxnLedger(allTransactions);
  if (window._lastStats)      renderPaymentStats(window._lastStats);
}

// Load currencies from backend (non-blocking — falls back to hardcoded rates)
async function loadCurrencies() {
  try {
    const data = await apiFetch('/currencies');
    fxRates = data.rates;
    data.currencies.forEach(function(c) {
      currencySymbols[c.code] = c.symbol;
    });
  } catch(e) { /* use hardcoded fallback */ }
  buildCurrencyPickers();
}

function buildCurrencyPickers() {
  var options = Object.keys(fxRates).map(function(code) {
    var s = currencySymbols[code] || code;
    var labels = {
      INR:'Indian Rupee', USD:'US Dollar', EUR:'Euro', GBP:'British Pound',
      CAD:'Canadian Dollar', AUD:'Australian Dollar', JPY:'Japanese Yen',
      CHF:'Swiss Franc', SGD:'Singapore Dollar', AED:'UAE Dirham'
    };
    return '<option value="' + code + '"' + (code===activeCurrency?' selected':'') + '>' +
      code + ' - ' + (labels[code]||code) + ' (' + s + ')' + '</option>';
  }).join('');
  document.querySelectorAll('.currency-picker').forEach(function(el){ el.innerHTML = options; });
}

// ---- BANK ACCOUNTS ----
async function loadAccounts() {
  try {
    var results = await Promise.all([ apiFetch('/accounts'), apiFetch('/stats/payments') ]);
    allAccounts = results[0];
    window._lastStats = results[1];
    renderPaymentStats(results[1]);
    renderAccountsList(allAccounts);
    populateAccountDropdowns(allAccounts);
    var pill = document.getElementById('accounts-sync-pill');
    if (pill) pill.textContent = 'Synced just now';
  } catch(e) {
    var el = document.getElementById('accounts-list');
    if (el) el.innerHTML = '<div class="card"><p style="color:var(--danger);font-size:13px;">Backend not reachable. Run: node backend/server.js<br>' + e.message + '</p></div>';
  }
}

function renderPaymentStats(stats) {
  function set(id, val) { var el=document.getElementById(id); if(el) el.textContent=val; }
  var tb = convert(stats.totalBalance);
  set('stat-total-balance', (tb>=0?'+':'-') + sym() + Math.abs(tb).toLocaleString('en-IN',{minimumFractionDigits:decimals(),maximumFractionDigits:decimals()}));
  set('stat-active-accounts', stats.activeAccounts);
  set('stat-pending', stats.pendingTxns);
  set('stat-flagged', stats.flaggedTxns);
  set('stat-month-spend',  fmtStat(stats.thisMonthSpend));
  set('stat-month-income', '+' + sym() + convert(stats.thisMonthIncome).toLocaleString('en-IN',{minimumFractionDigits:decimals(),maximumFractionDigits:decimals()}));
  set('stat-failed', stats.failedTxns);
  set('stat-flagged-txn', stats.flaggedTxns);
  renderVolumeChart(stats.monthlyVolume);
}

function renderAccountsList(accounts) {
  var el = document.getElementById('accounts-list');
  var hint = document.getElementById('accounts-count-hint');
  if (hint) hint.textContent = accounts.length + ' account' + (accounts.length!==1?'s':'') +
    ' - ' + accounts.filter(function(a){return a.status==='active';}).length + ' active';

  if (!accounts.length) {
    el.innerHTML = '<div class="card"><div class="empty-state"><p>No accounts yet. Click Add Account to get started.</p></div></div>';
    return;
  }

  el.innerHTML = accounts.map(function(acc) {
    var balStr = fmtBal(acc.balance);
    return '<div class="account-card" id="acc-card-' + acc.id + '">' +
      '<div class="account-card-header">' +
        '<div class="account-bank-badge" style="background:' + acc.color + '">' + initials(acc.bankName) + '</div>' +
        '<div class="account-info">' +
          '<div class="account-bank-name">' + acc.bankName + ' ' + acc.accountNumber + '</div>' +
          '<div class="account-meta">' + acc.accountType + ' - ' + acc.holderName +
            ' &nbsp;<span class="status-badge ' + acc.status + '">' + (acc.status==='active'?'Active':'Disconnected') + '</span></div>' +
        '</div>' +
        '<div class="account-balance-wrap">' +
          '<div class="account-balance ' + (acc.balance>=0?'positive':'negative') + '">' + balStr + '</div>' +
          '<div class="account-balance-label">' + activeCurrency + ' balance</div>' +
        '</div>' +
      '</div>' +
      '<div class="account-card-body">' +
        '<div class="account-stat-chip">' + acc.transactionCount + ' transaction' + (acc.transactionCount!==1?'s':'') + '</div>' +
        (acc.pendingCount>0 ? '<div class="account-stat-chip" style="color:var(--amber)">' + acc.pendingCount + ' pending</div>' : '') +
        (acc.flaggedCount>0 ? '<div class="account-stat-chip" style="color:var(--danger)">' + acc.flaggedCount + ' flagged</div>' : '') +
        '<div class="account-stat-chip">Synced ' + timeSince(acc.lastSync) + '</div>' +
        '<div class="account-card-actions">' +
          '<button class="btn btn-sm" onclick="goTo(\'payments\');setTimeout(function(){document.getElementById(\'txn-filter-account\').value=\'' + acc.id + '\';loadTransactions();},100)">View transactions</button>' +
          '<button class="btn btn-sm btn-danger" onclick="deleteAccount(\'' + acc.id + '\',\'' + (acc.bankName+' '+acc.accountNumber).replace(/'/g,"") + '\')">Remove</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

function timeSince(iso) {
  var sec = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (sec < 60) return 'just now';
  if (sec < 3600) return Math.floor(sec/60) + 'm ago';
  if (sec < 86400) return Math.floor(sec/3600) + 'h ago';
  return Math.floor(sec/86400) + 'd ago';
}

function populateAccountDropdowns(accounts) {
  var opts = accounts.map(function(a){ return '<option value="'+a.id+'">'+a.bankName+' '+a.accountNumber+'</option>'; }).join('');
  var fs = document.getElementById('txn-filter-account');
  var ms = document.getElementById('txn-modal-account');
  var prev = fs ? fs.value : '';
  if (fs) { fs.innerHTML = '<option value="">All accounts</option>' + opts; if (prev) fs.value = prev; }
  if (ms) ms.innerHTML = '<option value="">Select account</option>' + opts;
}

window.openAddAccountModal = function() {
  document.getElementById('form-add-account').reset();
  hideError('form-account-error');
  openModal('modal-add-account');
};

window.submitAddAccount = async function(e) {
  e.preventDefault();
  hideError('form-account-error');
  var btn = document.getElementById('btn-add-account');
  var data = Object.fromEntries(new FormData(e.target));
  btn.disabled=true; btn.textContent='Connecting...';
  try {
    await apiFetch('/accounts', { method:'POST', body:JSON.stringify(data) });
    closeModal('modal-add-account');
    await loadAccounts();
  } catch(err) { showError('form-account-error', err.message); }
  finally { btn.disabled=false; btn.textContent='Connect Account'; }
};

window.deleteAccount = async function(id, name) {
  if (!confirm('Remove "' + name + '" and all its transactions?')) return;
  try { await apiFetch('/accounts/'+id, {method:'DELETE'}); await loadAccounts(); await loadTransactions(); }
  catch(err) { alert('Error: ' + err.message); }
};

// ---- ONLINE TRANSACTIONS ----
async function loadTransactions() {
  var accId  = document.getElementById('txn-filter-account').value;
  var status = document.getElementById('txn-filter-status').value;
  var path   = '/transactions?';
  if (accId)   path += 'accountId=' + accId + '&';
  if (status)  path += 'status=' + status + '&';
  try {
    var txns = await apiFetch(path);
    allTransactions = txns;
    renderTxnLedger(txns);
  } catch(e) {
    var el = document.getElementById('txn-ledger');
    if (el) el.innerHTML = '<p style="color:var(--danger);font-size:13px;padding:16px 0;">' + e.message + '</p>';
  }
}

var TXN_ICONS = {
  'Shopping':'shopping','Food & Drink':'food','Transport':'transport',
  'Subscriptions':'subscription','Housing':'home','Health':'health',
  'Income':'income','Transfer':'bank','Uncategorized':'card'
};

function renderTxnLedger(txns) {
  var el   = document.getElementById('txn-ledger');
  var hint = document.getElementById('txn-count-hint');
  if (hint) hint.textContent = txns.length + ' transaction' + (txns.length!==1?'s':'');

  if (!txns.length) {
    el.innerHTML = '<div class="empty-state"><p>No transactions found.</p></div>';
    return;
  }

  var accMap = {};
  allAccounts.forEach(function(a){ accMap[a.id] = a; });

  el.innerHTML = txns.map(function(t) {
    var acc = accMap[t.accountId];
    var label = acc ? acc.bankName+' '+acc.accountNumber : t.accountId;
    var icon  = TXN_ICONS[t.category] || 'card';
    var pos   = t.amount > 0;
    return '<div class="txn-row" onclick="openTxnDetail(\'' + t.id + '\')">' +
      '<div class="ledger-icon ' + (t.flagged?'amber':'') + '">' + svgIcon(icon) + '</div>' +
      '<div class="ledger-main">' +
        '<div class="ledger-title">' + t.merchant + '</div>' +
        '<div class="ledger-sub">' + fmtDateShort(t.date) + ' - ' + label + ' - ' + t.method + '</div>' +
        '<div class="ledger-tags" style="margin-top:5px;">' +
          '<span class="tag category">' + t.category + '</span>' +
          '<span class="status-badge ' + t.status + '">' + t.status + '</span>' +
          (t.flagged ? '<span class="tag anomaly">Flagged</span>' : '') +
        '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">' +
        '<div class="ledger-amount ' + (pos?'pos':'neg') + '">' + fmt(t.amount) + '</div>' +
        '<button class="txn-flag-btn ' + (t.flagged?'flagged':'') + '" title="' + (t.flagged?'Remove flag':'Flag') + '" ' +
          'onclick="event.stopPropagation();toggleFlag(\'' + t.id + '\',' + (!t.flagged) + ')">&#9873;</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

window.toggleFlag = async function(id, flagged) {
  try {
    await apiFetch('/transactions/'+id, { method:'PATCH', body:JSON.stringify({flagged:flagged}) });
    await loadTransactions();
    var stats = await apiFetch('/stats/payments');
    window._lastStats = stats;
    renderPaymentStats(stats);
  } catch(err) { alert('Error: ' + err.message); }
};

window.openTxnDetail = async function(id) {
  try {
    var t   = await apiFetch('/transactions/'+id);
    var acc = allAccounts.find(function(a){ return a.id===t.accountId; });
    var pos = t.amount > 0;
    var originalUSD = (t.amount<0?'-':'+')+' $'+Math.abs(t.amount).toFixed(2);
    document.getElementById('txn-detail-body').innerHTML =
      '<div class="detail-row"><span class="detail-key">Merchant</span><span class="detail-val">'+t.merchant+'</span></div>' +
      '<div class="detail-row"><span class="detail-key">Amount ('+activeCurrency+')</span>' +
        '<span class="detail-val" style="color:'+(pos?'var(--verdigris-deep)':'var(--ink)')+'">'+fmt(t.amount)+'</span></div>' +
      '<div class="detail-row"><span class="detail-key">Original (USD)</span><span class="detail-val">'+originalUSD+'</span></div>' +
      '<div class="detail-row"><span class="detail-key">Date</span><span class="detail-val">'+fmtDate(t.date)+'</span></div>' +
      '<div class="detail-row"><span class="detail-key">Account</span><span class="detail-val">'+(acc?acc.bankName+' '+acc.accountNumber:t.accountId)+'</span></div>' +
      '<div class="detail-row"><span class="detail-key">Category</span><span class="detail-val">'+t.category+'</span></div>' +
      '<div class="detail-row"><span class="detail-key">Method</span><span class="detail-val">'+t.method+'</span></div>' +
      '<div class="detail-row"><span class="detail-key">Status</span><span><span class="status-badge '+t.status+'">'+t.status+'</span></span></div>' +
      '<div class="detail-row"><span class="detail-key">Reference</span><span class="detail-val">'+t.reference+'</span></div>' +
      (t.description ? '<div class="detail-row"><span class="detail-key">Notes</span><span class="detail-val" style="font-family:var(--font-body)">'+t.description+'</span></div>' : '') +
      (t.flagged ? '<div class="detail-row"><span class="detail-key">Flag</span><span class="tag anomaly" style="font-size:12px;">Flagged for review</span></div>' : '');
    document.getElementById('txn-detail-actions').innerHTML =
      '<button class="btn" onclick="closeModal(\'modal-txn-detail\')">Close</button>' +
      '<button class="btn '+(t.flagged?'':'btn-danger')+'" onclick="closeModal(\'modal-txn-detail\');toggleFlag(\''+t.id+'\','+ (!t.flagged) +')">'+(t.flagged?'Remove flag':'Flag transaction')+'</button>' +
      '<button class="btn btn-danger" onclick="closeModal(\'modal-txn-detail\');deleteTxn(\''+t.id+'\')">Delete</button>';
    openModal('modal-txn-detail');
  } catch(err) { alert('Could not load transaction: '+err.message); }
};

window.deleteTxn = async function(id) {
  if (!confirm('Delete this transaction?')) return;
  try {
    await apiFetch('/transactions/'+id, {method:'DELETE'});
    await loadTransactions();
    var stats = await apiFetch('/stats/payments');
    window._lastStats = stats;
    renderPaymentStats(stats);
  } catch(err) { alert('Error: '+err.message); }
};

window.openAddTxnModal = function() {
  document.getElementById('form-add-txn').reset();
  hideError('form-txn-error');
  var accId = document.getElementById('txn-filter-account').value;
  if (accId) { var m=document.getElementById('txn-modal-account'); if(m) m.value=accId; }
  openModal('modal-add-txn');
};

window.submitAddTxn = async function(e) {
  e.preventDefault();
  hideError('form-txn-error');
  var data = Object.fromEntries(new FormData(e.target));
  var btn = e.target.querySelector('[type=submit]');
  btn.disabled=true; btn.textContent='Saving...';
  try {
    await apiFetch('/transactions', { method:'POST', body:JSON.stringify(data) });
    closeModal('modal-add-txn');
    await loadTransactions();
    var stats = await apiFetch('/stats/payments');
    window._lastStats = stats;
    renderPaymentStats(stats);
    await loadAccounts();
  } catch(err) { showError('form-txn-error', err.message); }
  finally { btn.disabled=false; btn.textContent='Save Transaction'; }
};

// Volume chart
function renderVolumeChart(volumes) {
  var converted = volumes.map(function(v){ return Math.round(v * rate()); });
  if (paymentChart) {
    paymentChart.data.datasets[0].data = converted;
    paymentChart.data.datasets[0].backgroundColor = converted.map(function(_,i){ return i===converted.length-1?'#C97A2B':'#3C7A6A'; });
    paymentChart.options.scales.y.ticks.callback = function(v){ return sym() + v.toLocaleString('en-IN'); };
    paymentChart.update();
    return;
  }
  var ctx = document.getElementById('paymentVolumeChart');
  if (!ctx) return;
  paymentChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels:['Feb','Mar','Apr','May','Jun','Jul'],
      datasets:[{
        data:converted,
        backgroundColor:converted.map(function(_,i){return i===converted.length-1?'#C97A2B':'#3C7A6A';}),
        borderRadius:4, maxBarThickness:32
      }]
    },
    options:{
      plugins:{legend:{display:false}},
      scales:{
        x:{grid:{display:false},ticks:{color:'#4A5350',font:{family:'IBM Plex Mono',size:11}}},
        y:{grid:{color:'rgba(26,36,33,0.08)'},ticks:{color:'#4A5350',font:{family:'IBM Plex Mono',size:11},
          callback:function(v){return sym()+v.toLocaleString('en-IN');}}}
      }
    }
  });
}

// Navigation hooks
var accountsLoaded=false, transactionsLoaded=false;
var _origGoTo = window.goTo;
window.goTo = function(screen) {
  _origGoTo(screen);
  if (screen==='accounts' && !accountsLoaded) { accountsLoaded=true; loadAccounts(); }
  if (screen==='payments') {
    if (!accountsLoaded) { accountsLoaded=true; loadAccounts().then(function(){ loadTransactions(); }); }
    else if (!transactionsLoaded) { transactionsLoaded=true; loadTransactions(); }
    else { loadTransactions(); }
  }
};

// Escape key closes modals
document.addEventListener('keydown', function(e) {
  if (e.key!=='Escape') return;
  ['modal-txn-detail','modal-add-txn','modal-add-account'].forEach(function(id){
    var el=document.getElementById(id);
    if (el && !el.hidden) { closeModal(id); }
  });
});

// Settings: Save changes toast
window.saveSettings = function() {
  var toast = document.getElementById('settings-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'settings-toast';
    toast.className = 'settings-toast';
    toast.textContent = 'Settings saved successfully';
    document.body.appendChild(toast);
  }
  // Apply currency from settings dropdown
  var cur = document.getElementById('set-currency');
  if (cur) onCurrencyChange(cur.value);
  toast.classList.add('show');
  setTimeout(function(){ toast.classList.remove('show'); }, 2800);
};

// Init
loadCurrencies();
