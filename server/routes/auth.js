const router  = require("express").Router();
const jwt     = require("jsonwebtoken");
const User    = require("../models/User");
const auth    = require("../middleware/auth");
const mongoose = require("mongoose");

const isConnected = () => mongoose.connection.readyState === 1;
const dbError = (res) => res.status(503).json({ error: "Database not connected. Set MONGO_URI in server/.env - get free Atlas at https://cloud.mongodb.com" });

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const { firstName, lastName, email, mobile, password } = req.body;
    if (!firstName || !email || !mobile || !password)
      return res.status(400).json({ error: "firstName, email, mobile and password are required" });
    const exists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (exists) return res.status(400).json({ error: "Email or mobile already registered" });
    const user  = await User.create({ firstName, lastName, email, mobile, password });
    const token = sign(user._id);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/login", async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: "identifier and password are required" });
    const user = await User.findOne({ $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }] });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = sign(user._id);
    res.json({ token, user: safeUser(user) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/me", auth, (req, res) => {
  res.json(safeUser(req.user));
});

router.patch("/profile", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const allowed = ["firstName","lastName","mobile","pan","language","currency","dateFormat","budgetLimits","notifications","twoFactorEnabled"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(safeUser(user));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/password", auth, async (req, res) => {
  if (!isConnected()) return dbError(res);
  try {
    const { currentPassword, newPassword } = req.body;
    const user  = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function safeUser(u) {
  return {
    id: u._id, firstName: u.firstName, lastName: u.lastName,
    fullName: u.lastName ? u.firstName + " " + u.lastName : u.firstName,
    initials: ((u.firstName||"")[0] + (u.lastName||"")[0]).toUpperCase(),
    email: u.email, mobile: u.mobile, pan: u.pan,
    language: u.language, currency: u.currency,
    dateFormat: u.dateFormat, budgetLimits: u.budgetLimits,
    notifications: u.notifications, twoFactorEnabled: u.twoFactorEnabled
  };
}

module.exports = router;
