const router      = require('express').Router()
const auth        = require('../middleware/auth')
const Account     = require('../models/Account')
const Transaction = require('../models/Transaction')

// GET /api/accounts
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id }).sort('-createdAt')
    const enriched = await Promise.all(accounts.map(async acc => {
      const txns = await Transaction.find({ account: acc._id })
      return {
        ...acc.toObject(),
        transactionCount: txns.length,
        pendingCount: txns.filter(t => t.status === 'pending').length,
        flaggedCount: txns.filter(t => t.flagged).length,
      }
    }))
    res.json(enriched)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/accounts/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const acc = await Account.findOne({ _id: req.params.id, user: req.user._id })
    if (!acc) return res.status(404).json({ error: 'Account not found' })
    res.json(acc)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/accounts
router.post('/', auth, async (req, res) => {
  try {
    const { bankName, accountType, accountNumber, holderName, balance, currency, color } = req.body
    if (!bankName || !accountType || !accountNumber || !holderName)
      return res.status(400).json({ error: 'bankName, accountType, accountNumber, holderName required' })
    const acc = await Account.create({
      user: req.user._id, bankName, accountType, accountNumber,
      holderName, balance: parseFloat(balance) || 0,
      currency: currency || 'INR', color: color || '#3C7A6A'
    })
    res.status(201).json(acc)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PATCH /api/accounts/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const allowed = ['bankName','accountType','accountNumber','holderName','balance','currency','status','color']
    const updates = { lastSync: new Date() }
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    const acc = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, updates, { new: true }
    )
    if (!acc) return res.status(404).json({ error: 'Account not found' })
    res.json(acc)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/accounts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const acc = await Account.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!acc) return res.status(404).json({ error: 'Account not found' })
    await Transaction.deleteMany({ account: req.params.id })
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
