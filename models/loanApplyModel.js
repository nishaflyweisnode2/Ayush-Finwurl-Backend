const mongoose = require('mongoose');

const loanDetailsSchema = new mongoose.Schema({
    mainTitle: { type: String },
    mainDescription: { type: String },
    data: [
        {
            title: String,
            description: String,
            image: String
        }
    ]
});

const LoanDetails = mongoose.model('ApplyLoan', loanDetailsSchema);

module.exports = LoanDetails;
