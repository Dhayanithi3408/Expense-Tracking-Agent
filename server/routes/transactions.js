const router      = require("express").Router();
const auth        = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const Account     = require("../models/Account");
const mongoose    = require("mongoose");

const isConnected = () => mongoose.connection.readyState === 1;
const dbError = (res) => res.status(503).json({ error: "Database not connected. Set MONGO_URI in server/.env" });

router.get("/stats", auth, async (req, res) => {
  if (!isConnected()) return res.json({ totalBalance:0, activeAccounts:0, pendingTxns:0, flaggedTxns:0, failedTxns:0, thisMonthSpend:0, thisMonthIncome:0, monthlyVolume:[0,0,0,0,0,0] });
  try {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const txns  = await Transaction.find({ user: req.user._id });
    const monthly = txns.filter(t => new Date(t.date) >= start);
    const accounts = await Account.find({ user: req.user._id, status: "active" });
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const monthlyVolume = [];
    for (let i = 5; i >= 0; i--) {
      const d    = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const spend = txns.filter(t => { const td = new Date(t.date); return td >= d && td <= dEnd && t.amount < 0; }).reduce((s, t) => s + Math.abs(t.amount), 0);
      monthlyVolume.push(Math.round(spend));
    }
    res.json({ totalBalance, activeAccounts: accounts.length, pendingTxns: txns.filter(t => t.status === "pending").length, flaggedTxns: txns.filter(t => t.flagged).length, failedTxns: txns.filter(t => t.status === "failed").length, thisMonthSpend: Math.abs(monthly.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)), thisMonthIncome: monthly.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0), monthlyVolume });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const filter = { user: req.user._id };
    if (req.query.accountId) filter.account  = req.query.accountId;
    if (req.query.status)    filter.status   = req.query.status;
    if (req.query.flagged === "true") filter.flagged = true;
    if (req.query.category)  filter.category = req.query.category;
    const txns = await Transaction.find(filter).populate("account", "bankName accountNumber color").sort("-date");
    res.json(txns);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user._id }).populate("account", "bankName accountNumber");
    if (!txn) return res.status(404).json({ error: "Transaction not found" });
    res.json(txn);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const { accountId, merchant, category, amount, type, method, status, description, currency } = req.body;
    if (!accountId || !merchant || amount === undefined) return res.status(400).json({ error: "accountId, merchant, amount required" });
    const acc = await Account.findOne({ _id: accountId, user: req.user._id });
    if (!acc) return res.status(404).json({ error: "Account not found" });
    const txn = await Transaction.create({ user: req.user._id, account: accountId, merchant, category: category || "Uncategorized", amount: parseFloat(amount), currency: currency || acc.currency, type: type || (parseFloat(amount) >= 0 ? "credit" : "debit"), method: method || "Online", status: status || "pending", description: description || "", reference: "REF-" + Date.now().toString(36).toUpperCase() });
    acc.balance = parseFloat((acc.balance + parseFloat(amount)).toFixed(2));
    acc.lastSync = new Date();
    await acc.save();
    res.status(201).json(txn);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/:id", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const allowed = ["merchant","category","status","description","flagged"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const txn = await Transaction.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true });
    if (!txn) return res.status(404).json({ error: "Transaction not found" });
    res.json(txn);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const txn = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ error: "Transaction not found" });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
