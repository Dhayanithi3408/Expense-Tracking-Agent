require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const jwt      = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const User        = require('./models/User');
const Account     = require('./models/Account');
const Transaction = require('./models/Transaction');
const auth        = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── DB Connect ────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB error:', err.message);
    console.log('Running with in-memory fallback...');
  });

// ─── AUTH ──────────────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body;
    if (!firstName || !email || !mobile || !password)
      return res.status(400).json({ error: 'All fields required' });

    const exists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (exists) return res.status(400).json({ error: 'Email or mobile already registered' });

    const user = await User.create({ firstName, lastName, email, mobile, password });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password)
      return res.status(400).json({ error: 'Identifier and password required' });

    const user = await User.findOne({ $or: [{ email: identifier }, { mobile: identifier }] });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', auth, (req, res) => {
  res.json(req.user.toSafeObject());
});

// PATCH /api/auth/profile
app.patch('/api/auth/profile', auth, async (req, res) => {
  try {
    const allowed = ['firstName', 'lastName', 'mobile', 'pan', 'language', 'currency', 'avatar'];
    allowed.forEach(k => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
    await req.user.save();
    res.json(req.user.toSafeObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/password
app.patch('/api/auth/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(400).json({ error: 'Current password incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ACCOUNTS ──────────────────────────────────────────────────────────────────

app.get('/api/accounts', auth, async (req, res) => {
  const accounts = await Account.find({ user: req.user._id }).sort('-createdAt');
  const withStats = await Promise.all(accounts.map(async acc => {
    const txns = await Transaction.find({ account: acc._id });
    return {
      ...acc.toObject(),
      transactionCount: txns.length,
      pendingCount: txns.filter(t => t.status === 'pending').length,
      flaggedCount: txns.filter(t => t.flagged).length
    };
  }));
  res.json(withStats);
});

app.post('/api/accounts', auth, async (req, res) => {
  try {
    const acc = await Account.create({ ...req.body, user: req.user._id });
    res.status(201).json({ ...acc.toObject(), transactionCount: 0, pendingCount: 0, flaggedCount: 0 });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/accounts/:id', auth, async (req, res) => {
  try {
    const acc = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { ...req.body, lastSync: new Date() },
      { new: true }
    );
    if (!acc) return res.status(404).json({ error: 'Account not found' });
    res.json(acc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/accounts/:id', auth, async (req, res) => {
  const acc = await Account.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!acc) return res.status(404).json({ error: 'Account not found' });
  await Transaction.deleteMany({ account: req.params.id });
  res.json({ success: true });
});

// ─── TRANSACTIONS ───────────────────────────────────────────────────────────────

app.get('/api/transactions', auth, async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.accountId) filter.account = req.query.accountId;
  if (req.query.status)    filter.status  = req.query.status;
  if (req.query.flagged === 'true') filter.flagged = true;
  const txns = await Transaction.find(filter).populate('account', 'bankName accountNumber').sort('-date');
  res.json(txns);
});

app.post('/api/transactions', auth, async (req, res) => {
  try {
    const { accountId, amount, ...rest } = req.body;
    const acc = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!acc) return res.status(404).json({ error: 'Account not found' });

    const txn = await Transaction.create({
      ...rest,
      amount: parseFloat(amount),
      type: parseFloat(amount) >= 0 ? 'credit' : 'debit',
      account: accountId,
      user: req.user._id,
      reference: 'REF-' + uuidv4().slice(0, 6).toUpperCase()
    });
    // Update account balance
    acc.balance = parseFloat((acc.balance + parseFloat(amount)).toFixed(2));
    acc.lastSync = new Date();
    await acc.save();
    res.status(201).json(txn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/transactions/:id', auth, async (req, res) => {
  try {
    const txn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!txn) return res.status(404).json({ error: 'Transaction not found' });
    res.json(txn);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', auth, async (req, res) => {
  const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ success: true });
});

// ─── STATS ──────────────────────────────────────────────────────────────────────

app.get('/api/stats', auth, async (req, res) => {
  const accounts = await Account.find({ user: req.user._id, status: 'active' });
  const txns     = await Transaction.find({ user: req.user._id });

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const now = new Date();
  const thisMonthTxns = txns.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const monthlySpend  = thisMonthTxns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const monthlyIncome = thisMonthTxns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  // Last 6 months spend
  const volumeData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const spend = txns
      .filter(t => { const td = new Date(t.date); return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth() && t.amount < 0; })
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    volumeData.push({ month: d.toLocaleString('en-IN', { month: 'short' }), spend: Math.round(spend) });
  }

  res.json({
    totalBalance: parseFloat(totalBalance.toFixed(2)),
    activeAccounts: accounts.length,
    pendingTxns:  txns.filter(t => t.status === 'pending').length,
    flaggedTxns:  txns.filter(t => t.flagged).length,
    failedTxns:   txns.filter(t => t.status === 'failed').length,
    monthlySpend:  parseFloat(monthlySpend.toFixed(2)),
    monthlyIncome: parseFloat(monthlyIncome.toFixed(2)),
    volumeData
  });
});

// ─── CURRENCIES ─────────────────────────────────────────────────────────────────

app.get('/api/currencies', (req, res) => {
  res.json({
    base: 'INR',
    currencies: [
      { code: 'INR', symbol: '₹', name: 'Indian Rupee',       flag: '🇮🇳', rate: 1 },
      { code: 'USD', symbol: '$', name: 'US Dollar',           flag: '🇺🇸', rate: 0.012 },
      { code: 'EUR', symbol: '€', name: 'Euro',                flag: '🇪🇺', rate: 0.011 },
      { code: 'GBP', symbol: '£', name: 'British Pound',       flag: '🇬🇧', rate: 0.0095 },
      { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',        flag: '🇦🇪', rate: 0.044 },
      { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar',   flag: '🇸🇬', rate: 0.016 },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar',    flag: '🇨🇦', rate: 0.016 },
      { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',  flag: '🇦🇺', rate: 0.018 },
      { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',       flag: '🇯🇵', rate: 1.88 },
      { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc',        flag: '🇨🇭', rate: 0.011 },
    ]
  });
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.listen(PORT, () => console.log(`ExpenseAI API running on http://localhost:${PORT}`));
