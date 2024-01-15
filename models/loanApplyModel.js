const mongoose = require('mongoose');

const loanDetailsSchema = new mongoose.Schema({
    mainTitle: { type: String },
    mainDescription: { type: String },
    title: { type: String },
    description: { type: String },
    image: { type: String },
});

const LoanDetails = mongoose.model('ApplyLoan', loanDetailsSchema);

module.exports = LoanDetails;
