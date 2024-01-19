const mongoose = require("mongoose");

const BenefitsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    desc: {
        type: String,
    },
    status: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("Benefits", BenefitsSchema);