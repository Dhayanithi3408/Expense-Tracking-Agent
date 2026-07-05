const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, trim: true, default: '' },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile:    { type: String, required: true, trim: true },
  password:  { type: String, required: true },
  pan:       { type: String, trim: true, default: '' },
  avatar:    { type: String, default: '' },
  language:  { type: String, default: 'en' },
  currency:  { type: String, default: 'INR' },
  dateFormat:{ type: String, default: 'DD/MM/YYYY' },
  budgetLimits: {
    food:         { type: Number, default: 8000 },
    transport:    { type: Number, default: 3000 },
    shopping:     { type: Number, default: 5000 },
    subscriptions:{ type: Number, default: 1500 },
    health:       { type: Number, default: 2000 },
    entertainment:{ type: Number, default: 2500 },
  },
  notifications: {
    largeTransaction: { type: Boolean, default: true },
    weeklySummary:    { type: Boolean, default: true },
    budgetWarning:    { type: Boolean, default: true },
    suspiciousActivity:{ type: Boolean, default: true },
    billReminders:    { type: Boolean, default: false },
  },
  twoFactorEnabled: { type: Boolean, default: true },
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

userSchema.virtual('fullName').get(function () {
  return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName
})

userSchema.virtual('initials').get(function () {
  const f = this.firstName?.charAt(0) || ''
  const l = this.lastName?.charAt(0) || ''
  return (l ? f + l : f).toUpperCase()
})

module.exports = mongoose.model('User', userSchema)
