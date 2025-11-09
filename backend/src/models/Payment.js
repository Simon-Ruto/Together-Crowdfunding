const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  stripeSessionId: { type: String },
  status: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
