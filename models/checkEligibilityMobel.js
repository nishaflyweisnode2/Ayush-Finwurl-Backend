const mongoose = require('mongoose');

const eligibilityCheckSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategory',
    },
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
    mobileNumber: {
        type: String,
    },
    panNumber: {
        type: String,
    },
    dob: {
        type: Date,
    },
    accountNumber: {
        type: String,
    },
    income: {
        type: Number,
    },
    pinCode: {
        type: String,
    },

}, { timestamps: true });

const EligibilityCheck = mongoose.model('EligibilityCheck', eligibilityCheckSchema);

module.exports = EligibilityCheck;
