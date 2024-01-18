const mongoose = require('mongoose');

const financialTermSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    name: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    images: [
        {
            img: {
                type: String
            }
        }
    ],
});

const FinancialTerm = mongoose.model('FinancialTerm', financialTermSchema);

module.exports = FinancialTerm;
