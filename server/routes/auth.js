const router = require('express').Router()
const jwt    = require('jsonwebtoken')
const User   = require('../models/User')
const auth   = require('../middleware/auth')

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, password } = req.body
    if (!firstName || !email || !mobile || !password)
      return res.status(400).json({ error: 'firstName, email, mobile and password are required' })

    const exists = await User.findOne({ $or: [{ email }, { mobile }] })
    if (exists) return res.status(400).json({ error: 'Email or mobile already registered' })

    const user = await User.create({ firstName, lastName, email, mobile, password })
    const token = sign(user._id)
    res.status(201).json({
      token,
      user: {
        id: user._id, firstName: user.firstName, lastName: user.lastName,
        fullName: user.fullName, initials: user.initials,
        email: user.email, mobile: user.mobile,
        language: user.language, currency: user.currency,
        budgetLimits: user.budgetLimits, notifications: user.notifications
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body
    if (!identifier || !password)
      return res.status(400).json({ error: 'identifier and password are required' })

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { mobile: identifier }]
    })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ error: 'Invalid credentials' })

    const token = sign(user._id)
    res.json({
      token,
      user: {
        id: user._id, firstName: user.firstName, lastName: user.lastName,
        fullName: user.fullName, initials: user.initials,
        email: user.email, mobile: user.mobile,
        language: user.language, currency: user.currency,
        budgetLimits: user.budgetLimits, notifications: user.notifications
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  const u = req.user
  res.json({
    id: u._id, firstName: u.firstName, lastName: u.lastName,
    fullName: u.fullName, initials: u.initials,
    email: u.email, mobile: u.mobile, pan: u.pan,
    language: u.language, currency: u.currency,
    dateFormat: u.dateFormat, budgetLimits: u.budgetLimits,
    notifications: u.notifications, twoFactorEnabled: u.twoFactorEnabled
  })
})

// PATCH /api/auth/profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const allowed = ['firstName','lastName','mobile','pan','language','currency',
                     'dateFormat','budgetLimits','notifications','twoFactorEnabled']
    const updates = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
    res.json({
      id: user._id, firstName: user.firstName, lastName: user.lastName,
      fullName: user.fullName, initials: user.initials,
      email: user.email, mobile: user.mobile, pan: user.pan,
      language: user.language, currency: user.currency,
      dateFormat: user.dateFormat, budgetLimits: user.budgetLimits,
      notifications: user.notifications, twoFactorEnabled: user.twoFactorEnabled
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/auth/password
router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)
    const match = await user.comparePassword(currentPassword)
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' })
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
