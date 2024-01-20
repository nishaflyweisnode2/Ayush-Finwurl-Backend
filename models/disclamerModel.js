const mongoose = require('mongoose');

const DisclamerSchema = new mongoose.Schema({
    content: { type: String, required: true },

}, { timestamps: true });

module.exports = mongoose.model('Disclamer', DisclamerSchema);