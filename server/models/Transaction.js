const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account:    { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  merchant:   { type: String, required: true, trim: true },
  category:   { type: String, default: 'Uncategorized' },
  amount:     { type: Number, required: true },
  currency:   { type: String, default: 'INR' },
  type:       { type: String, enum: ['credit','debit'], required: true },
  method:     { type: String, default: 'Online' },
  status:     { type: String, enum: ['cleared','pending','failed'], default: 'pending' },
  description:{ type: String, default: '' },
  reference:  { type: String, default: '' },
  flagged:    { type: Boolean, default: false },
  date:       { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)
