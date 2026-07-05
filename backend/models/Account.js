const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bankName:      { type: String, required: true, trim: true },
  accountType:   { type: String, enum: ['Savings', 'Checking', 'Credit Card', 'Investment'], default: 'Savings' },
  accountNumber: { type: String, required: true, trim: true },
  holderName:    { type: String, required: true, trim: true },
  balance:       { type: Number, default: 0 },
  currency:      { type: String, default: 'INR' },
  status:        { type: String, enum: ['active', 'disconnected'], default: 'active' },
  color:         { type: String, default: '#3C7A6A' },
  lastSync:      { type: Date, default: Date.now },
  createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema);
