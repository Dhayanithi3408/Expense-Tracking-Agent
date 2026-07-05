const router      = require("express").Router();
const auth        = require("../middleware/auth");
const Account     = require("../models/Account");
const Transaction = require("../models/Transaction");
const mongoose    = require("mongoose");

const isConnected = () => mongoose.connection.readyState === 1;
const dbError = (res) => res.status(503).json({ error: "Database not connected. Set MONGO_URI in server/.env" });

router.get("/", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const accounts = await Account.find({ user: req.user._id }).sort("-createdAt");
    const enriched = await Promise.all(accounts.map(async acc => {
      const txns = await Transaction.find({ account: acc._id });
      return { ...acc.toObject(), transactionCount: txns.length, pendingCount: txns.filter(t => t.status === "pending").length, flaggedCount: txns.filter(t => t.flagged).length };
    }));
    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const { bankName, accountType, accountNumber, holderName, balance, currency, color } = req.body;
    if (!bankName || !accountType || !accountNumber || !holderName)
      return res.status(400).json({ error: "bankName, accountType, accountNumber, holderName required" });
    const acc = await Account.create({ user: req.user._id, bankName, accountType, accountNumber, holderName, balance: parseFloat(balance) || 0, currency: currency || "INR", color: color || "#3C7A6A" });
    res.status(201).json(acc);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/:id", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const allowed = ["bankName","accountType","accountNumber","holderName","balance","currency","status","color"];
    const updates = { lastSync: new Date() };
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const acc = await Account.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, updates, { new: true });
    if (!acc) return res.status(404).json({ error: "Account not found" });
    res.json(acc);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/:id", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const acc = await Account.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!acc) return res.status(404).json({ error: "Account not found" });
    await Transaction.deleteMany({ account: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
