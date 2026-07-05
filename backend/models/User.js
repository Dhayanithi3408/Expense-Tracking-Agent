const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, trim: true, default: '' },
  email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
  mobile:     { type: String, required: true, trim: true },
  password:   { type: String, required: true },
  pan:        { type: String, default: '' },
  language:   { type: String, default: 'en' },
  currency:   { type: String, default: 'INR' },
  avatar:     { type: String, default: '' },
  createdAt:  { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (pw) {
  return bcrypt.compare(pw, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    mobile: this.mobile,
    pan: this.pan,
    language: this.language,
    currency: this.currency,
    avatar: this.avatar,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
