const mongoose = require('mongoose');

const loanDetailsSchema = new mongoose.Schema({
    loanAmount: { type: Number, required: true },
    annualInterestRate: { type: Number, required: true },
    loanTermMonths: { type: Number, required: true },
    additionalFees: { type: Number, default: 0 },
});

const LoanDetails = mongoose.model('LoanDetails', loanDetailsSchema);

module.exports = LoanDetails;
