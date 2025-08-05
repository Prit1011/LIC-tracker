const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  month: String, // e.g., "Aug-2025"
  amount: Number,
  status: {
    type: String,
    enum: ['Paid', 'Unpaid'],
    default: 'Unpaid'
  }
});

const userSchema = new mongoose.Schema({
  name: String,
  accountNumber: String,
  cifNumber1: String,
  cifNumber2: String,
  mobileNumber: String,
  nomineeName: String,
  monthlyAmount: Number,
  totalInstallments: Number,
  maturityAmount: Number,
  accountOpenDate: Date,
  accountCloseDate: Date,
  installments: [installmentSchema]
});

module.exports = mongoose.model('User', userSchema);
